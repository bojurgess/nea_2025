use std::sync::Arc;
use log::{error, info};
use reqwest::StatusCode;
use serde_json::json;
use tauri::Wry;
use tauri_plugin_store::Store;
use telemetry::{assists::Assists, session::{JSONTelemetrySession, Lap, Session}, JSONCarTelemetryData, Packet};

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

        let res = client.put(url)
            .bearer_auth(access_token)
            .json(&json!({
                "totalLaps": session.total_laps,
                "endDate": end_date,
                "totalDistance": session.total_distance,
            }))
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
                        Ok(res.json::<ApiSessionResponse>().await.unwrap())
                    },
                    _ => {
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

    async fn post_new_lap(&self, lap: &Lap, store: &Arc<Store<Wry>>) -> Result<ApiLapResponse, RequestError> {
        let client = reqwest::Client::new();
        match &self.session_uid {
            Some(uid) => {
                let url = format!("http://localhost:5173/api/session/{}/lap", uid);

                let raw_token = store.get("access_token").expect("Failed to get value from store");
                let access_token: String = serde_json::from_value(raw_token).unwrap();
                let payload = ApiLapRequest::new(lap.clone());

                let res = client.post(url)
                    .bearer_auth(access_token)
                    .json(&payload)
                    .send()
                    .await;

                match res {
                    Ok(res) => {
                        match res.status() {
                            StatusCode::OK => {
                                Ok(res.json::<ApiLapResponse>().await.unwrap())
                            },
                            _ => {
                                Err(RequestError::HttpError(res.status()))
                            }
                        }
                    },
                    Err(e) => {
                        Err(RequestError::ReqwestError(e))
                    }
                }
            },
            None => {
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
                            info!("Created new telemetry session on backend");       
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
                        Some(stored_assists) => {
                            stored_assists.steering_assist = Some(p.steering_assist);
                            stored_assists.braking_assist = Some(p.braking_assist);
                            stored_assists.gearbox_assist = Some(p.gearbox_assist);
                            stored_assists.pit_assist = Some(p.pit_assist);
                            stored_assists.pit_release_assist = Some(p.pit_release_assist);
                            stored_assists.ers_assist = Some(p.ers_assist);
                            stored_assists.drs_assist = Some(p.drs_assist);
                            stored_assists.dynamic_racing_line = Some(p.dynamic_racing_line);
                            if stored_assists.is_initialised() {
                                if let Some(lap) = &mut self.current_lap {
                                    lap.assists = Some(stored_assists.clone());
                                }                        
                            }
                        }
                    }
                }
            }
            Packet::CarStatus(p) => {
                let car_status_data = p.car_status_data[self.player_car_index as usize];
                match &mut self.assists {
                    Some(stored_assists) => {
                        stored_assists.anti_lock_brakes = Some(car_status_data.anti_lock_brakes);
                        stored_assists.traction_control = Some(car_status_data.traction_control);
                        if stored_assists.is_initialised() {
                            if let Some(lap) = &mut self.current_lap {
                                lap.assists = Some(stored_assists.clone());
                            }                        
                        }
                    },
                    None => {
                        self.assists = Some(Assists::from_car_status(p, self.player_car_index));
                    }
                }
            }
            Packet::Lap(p) => {
                let lap_data = p.lap_data[self.player_car_index as usize];
                self.total_distance = Some(lap_data.total_distance);
            
                match &mut self.current_lap {
                    Some(lap) => {
                        if lap.lap_number == lap_data.current_lap_num - 1 {
                            lap.lap_time_in_ms = lap_data.current_lap_time_in_ms;
                            lap.sector1_time_in_ms = lap_data.sector1_time_in_ms;
                            lap.sector2_time_in_ms = lap_data.sector2_time_in_ms;
                            lap.driver_status = lap_data.driver_status;
                            lap.lap_invalid = lap_data.current_lap_invalid;
                        } else if lap.lap_number < lap_data.current_lap_num - 1 {
                            lap.lap_time_in_ms = lap_data.last_lap_time_in_ms;
            
                            let finished_lap = self.current_lap.take().unwrap();
                            match self.post_new_lap(&finished_lap, store).await {
                                Ok(_) => info!("Created new telemetry lap on backend"),
                                Err(e) => error!("{:#?}", e),
                            }
            
                            self.current_lap = Some(Lap::new(lap_data, self.assists.clone()));
                        } else {
                            self.current_lap = None;
                        }
                    }
                    None => {
                        self.current_lap = Some(Lap::new(lap_data, self.assists.clone()));
                    }
                }
            }
            Packet::CarTelemetry(p) => {
                if let Some(lap) = &mut self.current_lap {
                    if lap.driver_status == 1 {
                        let telemetry_data = JSONCarTelemetryData::new(p.car_telemetry_data[self.player_car_index as usize], lap.lap_time_in_ms);
                        lap.car_telemetry.insert(telemetry_data.current_lap_time_in_ms, telemetry_data);
                    }
                }
            }
            // Packet::Motion(p) => {
            //     self.motion_data.push(p.car_motion_data[self.player_car_index as usize]);
            // }
            // Packet::MotionEx(p) => {
            //     self.motion_ex_data.push(MotionExData::from(p));
            // }
            _ => {}
        }
    }
}