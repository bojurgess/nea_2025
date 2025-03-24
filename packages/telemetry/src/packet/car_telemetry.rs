use serde::{Deserialize, Serialize};
use bincode;

use super::ToJSON;

#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct PacketCarTelemetryData {
    /// Header
    pub header: super::header::PacketHeader,
    /// Telemetry data for all cars
    pub car_telemetry_data: [CarTelemetryData; 22],
    /// Index of MFD panel open  
    /// - 255 = MFD closed  
    /// ### Single player race
    /// - 0 = Car setup
    /// - 1 = Pits
    /// - 2 = Damage
    /// - 3 = Engine
    /// - 4 = Temperatures
    pub mfd_panel_index: u8,
    /// See above
    pub mfd_panel_index_secondary_player: u8,
    /// Suggested gear for the player (1-8), 0 = none
    pub suggested_gear: i8,
}

impl super::FromBytes for PacketCarTelemetryData {
    fn from_bytes(buf: &[u8]) -> Result<Self, super::PacketError> {
        let cursor = std::io::Cursor::new(buf);
        match bincode::deserialize_from::<_, PacketCarTelemetryData>(cursor) {
            Ok(packet) => Ok(packet),
            Err(e) => Err(e.into()),
        }
    }
}

impl super::PacketAttributes for PacketCarTelemetryData {
    fn header(&self) -> super::header::PacketHeader {
        self.header.clone()
    }

    fn packet_id(&self) -> Result<super::PacketID, super::PacketError> {
        self.header.packet_id()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct CarTelemetryData {
    /// Speed of car in kilometers per hour
    pub speed: u16,
    /// Amount of throttle applied (0.0 to 1.0)
    pub throttle: f32,
    /// Steering (-1.0 (full left lock) to 1.0 (full right lock))
    pub steer: f32,
    /// Amount of brake applied (0.0 to 1.0)
    pub brake: f32,
    /// Amount of clutch applied (0 to 100)
    pub clutch: u8,
    /// Gear selected (1-8, N=0, R=-1)
    pub gear: i8,
    /// Engine RPM
    pub engine_rpm: u16,
    /// 0 = off, 1 = on
    pub drs: u8,
    /// Rev lights indicator (percentage)
    pub rev_lights_percent: u8,
    /// Rev lights (bit 0 = leftmost LED, bit 14 = rightmost LED)
    pub rev_lights_bit_value: u16,
    /// Brakes temperature (Celsius)
    pub brakes_temperature: [u16; 4],
    /// Tyres surface temperature (Celsius)
    pub tyres_surface_temperature: [u8; 4],
    /// Tyres inner temperature (Celsius)
    pub tyres_inner_temperature: [u8; 4],
    /// Engine temperature (Celsius)
    pub engine_temperature: u16,
    /// Tyres pressure (PSI)
    pub tyres_pressure: [f32; 4],
    /// Driving surface (see Appendices)
    pub surface_type: [u8; 4],
}

#[derive(Default, Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct JSONCarTelemetryData {
    /// Speed of car in kilometers per hour
    pub speed: u16,
    /// Amount of throttle applied (0.0 to 1.0)
    pub throttle: f32,
    /// Steering (-1.0 (full left lock) to 1.0 (full right lock))
    pub steer: f32,
    /// Amount of brake applied (0.0 to 1.0)
    pub brake: f32,
    /// Amount of clutch applied (0 to 100)
    pub clutch: u8,
    /// Gear selected (1-8, N=0, R=-1)
    pub gear: i8,
    /// Engine RPM
    pub engine_rpm: u16,
    /// 0 = off, 1 = on
    pub drs: u8,
    /// Brakes temperature (Celsius)
    pub brakes_temperature: [u16; 4],
    /// Tyres surface temperature (Celsius)
    pub tyres_surface_temperature: [u8; 4],
    /// Tyres inner temperature (Celsius)
    pub tyres_inner_temperature: [u8; 4],
    /// Engine temperature (Celsius)
    pub engine_temperature: u16,
    /// Tyres pressure (PSI)
    pub tyres_pressure: [f32; 4],
    /// Driving surface (see Appendices)
    pub surface_type: [u8; 4],
    /// Current lap time (ms)
    pub current_lap_time_in_ms: u32
}


impl JSONCarTelemetryData {
    pub fn new(value: CarTelemetryData, current_lap_time: u32) -> Self {
        Self {
            speed: value.speed,
            throttle: value.throttle,
            steer: value.steer,
            brake: value.brake,
            clutch: value.clutch,
            gear: value.gear,
            engine_rpm: value.engine_rpm,
            drs: value.drs,
            brakes_temperature: value.brakes_temperature,
            tyres_surface_temperature: value.tyres_surface_temperature,
            tyres_inner_temperature: value.tyres_inner_temperature,
            engine_temperature: value.engine_temperature,
            tyres_pressure: value.tyres_pressure,
            surface_type: value.surface_type,
            current_lap_time_in_ms: current_lap_time
        }
    }
}

impl ToJSON<CarTelemetryData> for JSONCarTelemetryData {}