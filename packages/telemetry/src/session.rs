use chrono::{DateTime, Utc};
use crate::{assists::Assists, CarMotionData, LapHistoryData, MotionExData, PacketHeader};
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
    pub assists: u16,
}

impl TryFrom<&Session> for JSONTelemetrySession {
    type Error = &'static str;

    fn try_from(value: &Session) -> Result<Self, Self::Error> {
        if !value.is_initialised() { Err("Session is not initialised!") }
        else {
            let assists = value.assists.as_ref();
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
                assists: assists.unwrap().get_mask()?
            })
        }
    }
}

#[derive(Default, Debug)]
pub struct Session {
    pub motion_upload_url: Option<String>,
    pub current_lap_id: u8,

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

    pub motion_data: Vec<CarMotionData>,
    pub motion_ex_data: Vec<MotionExData>,
    pub laps: Vec<LapHistoryData>,
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