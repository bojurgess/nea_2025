use std::collections::HashMap;

use log::{error, info};
use reqwest::StatusCode;
use telemetry::{session::{Session, SessionData}, LapHistoryData, MotionExData, Packet};

use crate::request::{ApiLapRequest, ApiLapResponse, ApiSessionResponse, RequestError, RequestHandler};

pub trait PacketHandler {
    async fn handle_packet(&mut self, packet: Packet) -> ();
}

pub async fn end_session(session: &mut Session) -> Result<(), RequestError> {
    session.end_date = Some(chrono::offset::Utc::now());

    if let Some(session_uid) = &session.session_uid {
        let end_date: chrono::DateTime<chrono::offset::Utc>;
        match session.end_date {
            Some(d) => end_date = d,
            None => {
                error!("No end date");
                return Err(RequestError::HttpError(StatusCode::BAD_REQUEST));
            }
        }
        let client = reqwest::Client::new();
        let url = format!("http://localhost:5173/api/session/{}", session_uid);
        let mut payload = HashMap::new();
        payload.insert("endDate", end_date);

        let res = client.put(url)
            .json(&payload)
            .send()
            .await;
        match res {
                Ok(res) => {
                    match res.status() {
                        StatusCode::OK => {
                            info!("Ended telemetry session on backend");
                            return Ok(());
                        },
                        _ => {
                            error!("{:#?}", res.status());
                            return Ok(());
                        }
                    }
                },
                Err(e) => {
                    error!("{:#?}", e);
                    return Err(RequestError::ReqwestError(e));
            }
        }
    }
    
    if let Some(motion_upload_url) = &session.motion_upload_url {
        if session.motion_data.motion_data.len() == 0 || session.motion_data.motion_ex_data.len() == 0 {
            info!("No motion data to upload");
            return Ok(())
        }

        let client = reqwest::Client::new();
        let res = client.post(motion_upload_url)
            .json(&session.motion_data)
            .send()
            .await;

        match res {
            Ok(res) => {
                match res.status() {
                    StatusCode::OK => {
                        info!("Uploaded motion data to backend");
                        return Ok(());
                    },
                    _ => {
                        error!("{:#?}", res.status());
                        return Ok(());
                    }
                }
            },
            Err(e) => {
                error!("{:#?}", e);
                return Err(RequestError::ReqwestError(e));
            }
        }
    }

    Ok(())
}

impl RequestHandler for Session {
    async fn post_new_session(&self, sess: &Session) -> Result<ApiSessionResponse, RequestError> {
        let client = reqwest::Client::new();
        let url = "http://localhost:5173/api/session";

        // TODO: Define URL for production environment (still unknown)
        // Ideally this is not hardcoded but

        let res = client.post(url)
            .json(&sess)
            .send()
            .await;

        match res {
            Ok(res) => {
                match res.status() {
                    StatusCode::OK => {
                        info!("Created new telemetry session on backend");
                        Ok(res.json::<ApiSessionResponse>().await.unwrap())
                    },
                    _ => {
                        error!("{:#?}", res.status());
                        Err(RequestError::HttpError(res.status()))
                    }
                }
            },
            Err(e) => {
                error!("{:#?}", e);
                Err(RequestError::ReqwestError(e))
            }
        }
    }

    async fn post_new_lap(&self, lap: &LapHistoryData) -> Result<ApiLapResponse, RequestError> {
        let client = reqwest::Client::new();
        match &self.session_uid {
            Some(uid) => {
                info!("Lap Data (post side): {:#?}", lap);
                info!("Lap ID (post side): {:#?}", self.laps.len() as u8);

                let url = format!("http://localhost:5173/api/session/{}/lap", uid);
                let res = client.post(url)
                    .json(&ApiLapRequest::new(lap, self.current_lap_id))
                    .send()
                    .await;

                match res {
                    Ok(res) => {
                        match res.status() {
                            StatusCode::OK => {
                                info!("Created new telemetry lap on backend");
                                Ok(res.json::<ApiLapResponse>().await.unwrap())
                            },
                            _ => {
                                error!("{:#?}", res.status());
                                Err(RequestError::HttpError(res.status()))
                            }
                        }
                    },
                    Err(e) => {
                        error!("{:#?}", e);
                        Err(RequestError::ReqwestError(e))
                    }
                }
            },
            None => {
                error!("No session");
                Err(RequestError::HttpError(StatusCode::BAD_REQUEST))
            }
        }
    }
}

impl PacketHandler for Session where Session: RequestHandler {
    async fn handle_packet(&mut self, packet: telemetry::Packet) -> () {
        match packet {
            Packet::Session(p) => {
                self.session_data = SessionData::from(p);
                if !self.initialised {
                    info!("POSTing Session Data");
                    // TODO: push session data to web
                    self.initialised = true;
                    let response = self.post_new_session(&self).await.unwrap();
                    self.motion_upload_url = Some(response.motion_upload_url);
                    self.session_uid = Some(response.session_uid);
                }
            }
            Packet::SessionHistory(p) => {
                if p.car_idx != self.player_car_index { return };

                let current_lap = p.lap_history_data[(self.current_lap_id - 1) as usize];
                info!("{:#?}", current_lap);

                if current_lap.lap_time_in_ms != 0 {
                    self.post_new_lap(&current_lap).await.unwrap();
                    self.current_lap_id += 1;
                }
            }
            Packet::Motion(p) => {
                self.motion_data.motion_data.push(p.car_motion_data[self.player_car_index as usize]);
            }
            Packet::MotionEx(p) => {
                self.motion_data.motion_ex_data.push(MotionExData::from(p));
            }
            _ => {}
        }
    }
}