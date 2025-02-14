use log::{error, info};
use reqwest::StatusCode;
use telemetry::{session::{Session, SessionData}, MotionExData, Packet};

pub trait PacketHandler {
    async fn handle_packet(&mut self, packet: Packet) -> ();
}

pub trait RequestHandler {
    async fn post_new_session(&self, sess: &Session) -> () {
        let client = reqwest::Client::new();
        #[cfg(dev)]
        let url = "http://localhost:5173/api/session";

        // TODO: Define URL for production environment (still unknown)
        // Ideally this is not hardcoded but

        let res = client.post(url)
            .json(&sess)
            .send()
            .await
            .unwrap();

        match res.status() {
            StatusCode::OK => {
                info!("Created new telemetry session on backend")
            },
            _ => {
                error!("{:#?}", res.status());
            }
        }
    }
}

impl RequestHandler for Session {}

impl PacketHandler for Session where Session: RequestHandler {
    async fn handle_packet(&mut self, packet: telemetry::Packet) -> () {
        match packet {
            Packet::Session(p) => {
                self.session_data = SessionData::from(p);
                if !self.initialised {
                    info!("POSTing Session Data");
                    // TODO: push session data to web
                    self.initialised = true;
                    self.post_new_session(&self).await;
                }
            }
            Packet::SessionHistory(p) => {
                if p.car_idx != self.player_car_index { return };
                let laps = p.lap_history_data.to_vec();

                if laps.len() > self.laps.len() {
                    // TODO: push lap data to web
                }
                self.laps = p.lap_history_data.to_vec();
            }
            Packet::Motion(p) => {
                self.motion_data.motion_data.push(p.car_motion_data[self.player_car_index as usize]);
            },
            Packet::MotionEx(p) => {
                self.motion_data.motion_ex_data.push(MotionExData::from(p));
            }
            _ => {}
        }
    }
}