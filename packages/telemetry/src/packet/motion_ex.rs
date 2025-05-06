use super::{FromBytes, PacketAttributes, ToJSON};

/// # Motion Ex Packet
///
/// The motion packet gives extended data for the car being driven
/// with the goal of driving a motion platform setup.
///
/// Frequency: Rate as specified in menus  
/// Size: 217 bytes  
/// Version: 1
#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct PacketMotionExData {
    /// Header
    pub header: super::header::PacketHeader,
    /// Suspension position (RL, RR, FL, FR)
    pub suspension_position: [f32; 4],
    /// Suspension velocity (RL, RR, FL, FR)
    pub suspension_velocity: [f32; 4],
    /// Suspension acceleration (RL, RR, FL, FR)
    pub suspension_acceleration: [f32; 4],
    /// Wheel speed (RL, RR, FL, FR)
    pub wheel_speed: [f32; 4],
    /// Slip ratio for each wheel
    pub wheel_slip_ratio: [f32; 4],
    /// Slip angle for each wheel
    pub wheel_slip_angle: [f32; 4],
    /// Lateral force for each wheel
    pub wheel_lat_force: [f32; 4],
    /// Longitudinal force for each wheel
    pub wheel_long_force: [f32; 4],
    /// Height of center of gravity above ground
    pub height_of_cog_above_ground: f32,
    /// Local velocity in X axis (m/s)
    pub local_velocity_x: f32,
    /// Local velocity in Y axis (m/s)
    pub local_velocity_y: f32,
    /// Local velocity in Z axis (m/s)
    pub local_velocity_z: f32,
    /// Angular velocity X component (radians/s)
    pub angular_velocity_x: f32,
    /// Angular velocity Y component
    pub angular_velocity_y: f32,
    /// Angular velocity Z
    pub angular_velocity_z: f32,
    /// Angular acceleration X component (radians/s²)
    pub angular_acceleration_x: f32,
    /// Angular acceleration Y component
    pub angular_acceleration_y: f32,
    /// Angular acceleration Z component
    pub angular_acceleration_z: f32,
    /// Current front wheels angle (radians)
    pub front_wheels_angle: f32,
    /// Vertical force for each wheel
    pub wheel_vert_force: [f32; 4],
}

#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct MotionExData {
    /// Suspension position (RL, RR, FL, FR)
    pub suspension_position: [f32; 4],
    /// Suspension velocity (RL, RR, FL, FR)
    pub suspension_velocity: [f32; 4],
    /// Suspension acceleration (RL, RR, FL, FR)
    pub suspension_acceleration: [f32; 4],
    /// Wheel speed (RL, RR, FL, FR)
    pub wheel_speed: [f32; 4],
    /// Slip ratio for each wheel
    pub wheel_slip_ratio: [f32; 4],
    /// Slip angle for each wheel
    pub wheel_slip_angle: [f32; 4],
    /// Lateral force for each wheel
    pub wheel_lat_force: [f32; 4],
    /// Longitudinal force for each wheel
    pub wheel_long_force: [f32; 4],
    /// Height of center of gravity above ground
    pub height_of_cog_above_ground: f32,
    /// Local velocity in X axis (m/s)
    pub local_velocity_x: f32,
    /// Local velocity in Y axis (m/s)
    pub local_velocity_y: f32,
    /// Local velocity in Z axis (m/s)
    pub local_velocity_z: f32,
    /// Angular velocity X component (radians/s)
    pub angular_velocity_x: f32,
    /// Angular velocity Y component
    pub angular_velocity_y: f32,
    /// Angular velocity Z
    pub angular_velocity_z: f32,
    /// Angular acceleration X component (radians/s²)
    pub angular_acceleration_x: f32,
    /// Angular acceleration Y component
    pub angular_acceleration_y: f32,
    /// Angular acceleration Z component
    pub angular_acceleration_z: f32,
    /// Current front wheels angle (radians)
    pub front_wheels_angle: f32,
    /// Vertical force for each wheel
    pub wheel_vert_force: [f32; 4],
}

impl ToJSON<PacketMotionExData> for PacketMotionExData {}
impl ToJSON<MotionExData> for MotionExData {}

impl FromBytes for PacketMotionExData {
    fn from_bytes(buf: &[u8]) -> Result<Self, super::PacketError> {
        let cursor = std::io::Cursor::new(buf);
        match bincode::deserialize_from(cursor) {
            Ok(packet) => Ok(packet),
            Err(e) => Err(e.into()),
        }
    }
}

impl PacketAttributes for PacketMotionExData {
    fn header(&self) -> super::header::PacketHeader {
        self.header.clone()
    }

    fn packet_id(&self) -> Result<super::PacketID, super::PacketError> {
        self.header.packet_id()
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

impl_from_packet!(MotionExData, PacketMotionExData, {
    suspension_position, suspension_velocity, suspension_acceleration,
    wheel_speed, wheel_slip_ratio, wheel_slip_angle,
    wheel_lat_force, wheel_long_force, height_of_cog_above_ground,
    local_velocity_x, local_velocity_y, local_velocity_z,
    angular_velocity_x, angular_velocity_y, angular_velocity_z,
    angular_acceleration_x, angular_acceleration_y, angular_acceleration_z,
    front_wheels_angle, wheel_vert_force
});