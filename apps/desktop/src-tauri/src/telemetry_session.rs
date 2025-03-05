use std::{collections::HashMap, sync::Arc};

use log::{error, info};
use reqwest::StatusCode;
use tauri::Wry;
use tauri_plugin_store::Store;
use telemetry::{assists::Assists, session::{JSONTelemetrySession, Session}, LapHistoryData, MotionExData, Packet};

use crate::request::{ApiLapRequest, ApiLapResponse, ApiSessionResponse, RequestError, RequestHandler};

pub trait PacketHandler {
    async fn handle_packet(&mut self, packet: Packet, store: &Arc<Store<Wry>>) -> ();
}

pub async fn end_session(session: &mut Session, store: &Arc<Store<Wry>>) -> Result<(), RequestError> {
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

        let raw_token = store.get("access_token").expect("Failed to get value from store");
        let access_token: String = serde_json::from_value(raw_token).unwrap();

        let mut payload = HashMap::new();
        payload.insert("endDate", end_date);

        let res = client.put(url)
            .bearer_auth(access_token)
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
        if session.motion_data.len() == 0 || session.motion_ex_data.len() == 0 {
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
    async fn post_new_session(&self, store: &Arc<Store<Wry>>) -> Result<ApiSessionResponse, RequestError> {
        let client = reqwest::Client::new();
        let url = "http://localhost:5173/api/session";

        // TODO: Define URL for production environment (still unknown)
        // Ideally this is not hardcoded but
        
        let raw_token = store.get("access_token").expect("Failed to get value from store");
        let access_token: String = serde_json::from_value(raw_token).unwrap();
        let payload = &JSONTelemetrySession::try_from(self).unwrap();

        let res = client.post(url)
            .bearer_auth(access_token)
            .json(payload)
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

    async fn post_new_lap(&self, lap: &LapHistoryData, store: &Arc<Store<Wry>>) -> Result<ApiLapResponse, RequestError> {
        let client = reqwest::Client::new();
        match &self.session_uid {
            Some(uid) => {
                let url = format!("http://localhost:5173/api/session/{}/lap", uid);

                let raw_token = store.get("access_token").expect("Failed to get value from store");
                let access_token: String = serde_json::from_value(raw_token).unwrap();

                let res = client.post(url)
                    .bearer_auth(access_token)
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
    async fn handle_packet(&mut self, packet: telemetry::Packet, store: &Arc<Store<Wry>>) -> () {
        match packet {
            Packet::Session(p) => {
                if self.is_initialised() && self.session_uid.is_none() {
                    info!("POSTing Session Data");
                    match self.post_new_session(store).await {
                        Ok(res) => {               
                            self.motion_upload_url = Some(res.motion_upload_url);
                            self.session_uid = Some(res.session_uid);
                        },
                        Err(err) => { error!("Error creating new backend session: ${:#?}", err) }
                    }
                } else {
                    self.weather = Some(p.weather);
                    self.time_of_day = Some(p.time_of_day);
                    self.total_laps = Some(p.total_laps);
                    self.track_id = Some(p.track_id);
                    match &mut self.assists {
                        None => self.assists = Some(Assists::from_session(p)),
                        Some(assists) => {
                            assists.steering_assist = Some(p.steering_assist);
                            assists.braking_assist = Some(p.braking_assist);
                            assists.gearbox_assist = Some(p.gearbox_assist);
                            assists.pit_assist = Some(p.pit_assist);
                            assists.pit_release_assist = Some(p.pit_release_assist);
                            assists.ers_assist = Some(p.ers_assist);
                            assists.drs_assist = Some(p.drs_assist);
                            assists.dynamic_racing_line = Some(p.dynamic_racing_line);
                        }
                    }
                }
            }
            Packet::CarStatus(p) => {
                match &mut self.assists {
                    None => self.assists = Some(Assists::from_car_status(p, self.player_car_index)),
                    Some(assists) => {
                        assists.traction_control = Some(p.car_status_data[self.player_car_index as usize].traction_control);
                        assists.anti_lock_brakes = Some(p.car_status_data[self.player_car_index as usize].anti_lock_brakes)
                    }
                }
            }
            Packet::Lap(p) => {
                self.total_distance = Some(p.lap_data[self.player_car_index as usize].total_distance);
            }
            Packet::SessionHistory(p) => {
                if p.car_idx != self.player_car_index { return };

                let current_lap = p.lap_history_data[(self.current_lap_id - 1) as usize];

                if current_lap.lap_time_in_ms != 0 {
                    match self.post_new_lap(&current_lap, store).await {
                        Err(err) => { error!("Error creating new backend lap object: ${:#?}", err) }
                        _ => {}
                    }
                    self.current_lap_id += 1;
                }
            }
            Packet::Motion(p) => {
                self.motion_data.push(p.car_motion_data[self.player_car_index as usize]);
            }
            Packet::MotionEx(p) => {
                self.motion_ex_data.push(MotionExData::from(p));
            }
            _ => {}
        }
    }
}