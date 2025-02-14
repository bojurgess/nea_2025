use chrono::{DateTime, Utc};
use crate::{CarMotionData, LapHistoryData, MotionExData, PacketHeader, PacketMotionExData, PacketSessionData, ToJSON};

use bincode;
use serde::{Serialize, Deserialize};

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub initialised: bool,

    pub player_car_index: u8,

    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,

    pub session_data: SessionData,
    pub motion_data: MotionData,
    pub laps: Vec<LapHistoryData>,
}

impl Session {
    pub fn new(header: PacketHeader) -> Self {
        Self { player_car_index: header.player_car_index, start_date: chrono::offset::Utc::now(), ..Default::default() }
    }
}

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionData {
    pub weather: u8,
    pub track_temperature: i8,
    pub air_temperature: i8,
    pub total_laps: u8,
    pub track_id: i8,
    pub ai_difficulty: u8,
    pub steering_assist: u8,
    pub braking_assist: u8,
    pub gearbox_assist: u8,
    pub dynamic_racing_line: u8,
    pub rule_set: u8,
    pub session_duration: u16,
}

#[derive(Serialize, Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MotionData {
    pub motion_data: Vec<CarMotionData>,
    pub motion_ex_data: Vec<MotionExData>
}

impl ToJSON<SessionData> for SessionData {}

impl ToJSON<MotionData> for MotionData {}

impl From<&[u8]> for MotionData {
    fn from(value: &[u8]) -> Self {
        bincode::deserialize(value).unwrap()
    }
}

macro_rules! impl_from_packet {
    ($struct:ident, $packet:ident, { $($field:ident),* }) => {
        impl From<$packet> for $struct {
            fn from(value: $packet) -> Self {
                Self {
                   $($field: value.$field),*
                }
            }
        }
    };
}

impl_from_packet!(SessionData, PacketSessionData, {
    weather, track_temperature, air_temperature,
    total_laps, track_id, ai_difficulty, steering_assist,
    braking_assist, gearbox_assist, dynamic_racing_line,
    rule_set, session_duration
});

impl_from_packet!(MotionExData, PacketMotionExData, {
    suspension_position, suspension_velocity, suspension_acceleration,
    wheel_speed, wheel_slip_ratio, wheel_slip_angle,
    wheel_lat_force, wheel_long_force, height_of_cog_above_ground,
    local_velocity_x, local_velocity_y, local_velocity_z,
    angular_velocity_x, angular_velocity_y, angular_velocity_z,
    angular_acceleration_x, angular_acceleration_y, angular_acceleration_z,
    front_wheels_angle, wheel_vert_force
});