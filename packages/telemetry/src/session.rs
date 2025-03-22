use std::collections::BTreeMap;

use chrono::{DateTime, Utc};
use crate::{assists::Assists, CarTelemetryData, LapHistoryData, PacketHeader};
use serde::{Serialize, Deserialize};

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JSONTelemetrySession {
    pub uid: Option<String>,
    pub player_car_index: u8,
    pub start_date: chrono::DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub total_distance: f32,
    pub weather: u8,
    pub time_of_day: u32,
    pub total_laps: u8,
    pub track_id: i8,
}

impl TryFrom<&Session> for JSONTelemetrySession {
    type Error = &'static str;

    fn try_from(value: &Session) -> Result<Self, Self::Error> {
        if !value.is_initialised() { Err("Session is not initialised!") }
        else {
            Ok(Self {
                uid: value.session_uid.clone(),
                player_car_index: value.player_car_index,
                start_date: value.start_date,
                end_date: value.end_date,
                total_distance: value.total_distance.unwrap(),
                weather: value.weather.unwrap(),
                time_of_day: value.time_of_day.unwrap(),
                total_laps: value.total_laps.unwrap(),
                track_id: value.track_id.unwrap(),
            })
        }
    }
}

#[derive(Default, Debug)]
pub struct Session {
    pub current_lap_id: u8,
    pub current_lap_frame_id: u32,

    pub session_uid: Option<String>,
    pub player_car_index: u8,

    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,

    pub total_distance: Option<f32>,
    pub weather: Option<u8>,
    pub time_of_day: Option<u32>,
    pub total_laps: Option<u8>,
    pub track_id: Option<i8>,
    pub assists: Option<Assists>,

    // potentially out of scope
    // pub motion_data: Vec<CarMotionData>,
    // pub motion_ex_data: Vec<MotionExData>,
    pub laps: Vec<Lap>,
}

impl Session {
    pub fn new(header: PacketHeader) -> Self {
        Self { player_car_index: header.player_car_index, start_date: chrono::offset::Utc::now(), current_lap_id: 1, ..Default::default() }
    }

    pub fn is_initialised(&self) -> bool {
        match &self.assists {
            None => false,
            Some(assists) => {
                self.total_distance.is_some() || self.weather.is_some() || self.time_of_day.is_some() ||
                self.total_laps.is_some() || self.track_id.is_some() || assists.is_initialised()
            }
        }
    }
}


#[derive(Serialize, Deserialize, Debug, Default, Clone, PartialEq)]
pub struct Lap {
    pub lap_time_in_ms: u32,
    pub sector_1_time_in_ms: u16,
    pub sector_2_time_in_ms: u16,
    pub sector_3_time_in_ms: u16,
    pub lap_valid_bit_flags: u8,
    pub assists: u16,
    pub car_telemetry: BTreeMap<u32, CarTelemetryData>,
}

impl Lap {
    pub fn new(lap_data: LapHistoryData, assists: Option<Assists>) -> Self {
        Lap {
            lap_time_in_ms: lap_data.lap_time_in_ms,
            sector_1_time_in_ms: lap_data.sector_1_time_in_ms,
            sector_2_time_in_ms: lap_data.sector_2_time_in_ms,
            sector_3_time_in_ms: lap_data.sector_3_time_in_ms,
            lap_valid_bit_flags: lap_data.lap_valid_bit_flags,
            assists: assists.unwrap().get_mask().unwrap(),
            car_telemetry: BTreeMap::new()
        }
    }
}