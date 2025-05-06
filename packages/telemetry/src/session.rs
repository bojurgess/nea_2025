use std::collections::BTreeMap;

use chrono::{DateTime, Utc};
use crate::{assists::Assists, JSONCarTelemetryData, LapData, PacketHeader};
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
    pub current_lap: Option<Lap>
}

impl Session {
    pub fn new(header: PacketHeader) -> Self {
        Self { player_car_index: header.player_car_index, start_date: chrono::offset::Utc::now(), ..Default::default() }
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

#[derive(Debug, Default, Clone)]
pub struct Lap {
    pub lap_number: u8,
    pub lap_time_in_ms: u32,
    pub driver_status: u8,
    pub sector1_time_in_ms: u16,
    pub sector2_time_in_ms: u16,
    pub lap_invalid: bool,
    pub assists: Option<Assists>,
    pub total_distance: f32,
    pub car_telemetry: BTreeMap<u32, JSONCarTelemetryData>
}

impl Lap {
    pub fn new(lap_data: LapData, assists: Option<Assists>) -> Self {
        Lap {
            // Removing one from the lap number is basically just a bandage fix to other problems
            // Specifically, the lap number gets updated between starting to post the lap and
            // actually making the request, but I don't have the time for a proper fix.
            lap_number: lap_data.current_lap_num - 1,
            lap_time_in_ms: lap_data.current_lap_time_in_ms,
            driver_status: lap_data.driver_status,
            sector1_time_in_ms: lap_data.sector1_time_in_ms,
            sector2_time_in_ms: lap_data.sector2_time_in_ms,
            lap_invalid: lap_data.current_lap_invalid,
            assists,
            total_distance: lap_data.total_distance,
            car_telemetry: BTreeMap::new()
        }
    }
}
