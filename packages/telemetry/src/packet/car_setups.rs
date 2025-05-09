use super::FromBytes;

/// # Car Setups packet
///
/// This packet details the car setups for each vehicle in the session. In
/// multiplayer games, other player cars will appear as blank, and spectators
/// cannot see any car setups.
///
/// Frequency: 2 per second  
/// Size: 1107 bytes  
/// Version: 1
#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct PacketCarSetupData {
    /// Header
    pub header: super::header::PacketHeader,
    /// Data for all cars on track
    car_setups: [CarSetupData; 22],
}

impl FromBytes for PacketCarSetupData {
    fn from_bytes(buf: &[u8]) -> Result<Self, super::PacketError> {
        let cursor = std::io::Cursor::new(buf);
        match bincode::deserialize_from::<_, PacketCarSetupData>(cursor) {
            Ok(packet) => Ok(packet),
            Err(e) => Err(e.into()),
        }
    }
}

impl super::PacketAttributes for PacketCarSetupData {
    fn header(&self) -> super::header::PacketHeader {
        self.header.clone()
    }

    fn packet_id(&self) -> Result<super::PacketID, super::PacketError> {
        self.header.packet_id()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
struct CarSetupData {
    /// Front wing aero
    pub front_wing: u8,
    /// Rear wing aero
    pub rear_wing: u8,
    /// Differential adjustment on throttle (percentage)
    pub on_throttle: u8,
    /// Differential adjustment off throttle (percentage)
    pub off_throttle: u8,
    /// Front camber angle (suspension geometry)
    pub front_camber: f32,
    /// Rear camber angle (suspension geometry)
    pub rear_camber: f32,
    /// Front toe angle (suspension geometry)
    pub front_toe: f32,
    /// Rear toe angle (suspension geometry)
    pub rear_toe: f32,
    /// Front suspension
    pub front_suspension: u8,
    /// Rear suspension
    pub rear_suspension: u8,
    /// Front anti-roll bar
    pub front_anti_roll_bar: u8,
    /// Rear anti-roll bar
    pub rear_anti_roll_bar: u8,
    /// Front ride height
    pub front_suspension_height: u8,
    /// Rear ride height
    pub rear_suspension_height: u8,
    /// Brake pressure (percentage)
    pub brake_pressure: u8,
    /// Brake bias (percentage)
    pub brake_bias: u8,
    /// Rear left tyre pressure (PSI)
    pub rear_left_tyre_pressure: f32,
    /// Rear right tyre pressure (PSI)
    pub rear_right_tyre_pressure: f32,
    /// Front left tyre pressure (PSI)
    pub front_left_tyre_pressure: f32,
    /// Front right tyre pressure (PSI)
    pub front_right_tyre_pressure: f32,
    /// Ballast
    pub ballast: u8,
    /// Fuel load
    pub fuel_load: f32,
}
