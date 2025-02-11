use telemetry::{session::{Session, SessionData}, MotionExData, Packet};

pub trait PacketHandler {
    fn handle_packet(&mut self, packet: Packet) -> ();
}

impl PacketHandler for Session {
    fn handle_packet(&mut self, packet: telemetry::Packet) -> () {
        match packet {
            Packet::Session(p) => {
                self.session_data = SessionData::from(p);
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