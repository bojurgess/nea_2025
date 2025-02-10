use chrono::{DateTime, Utc};
use log::info;
use telemetry::{CarMotionData, LapHistoryData, Packet, PacketAttributes, PacketMotionExData, PacketSessionData};

#[derive(Default, Debug)]
pub struct GameSession {
    pub session_uid: u64,
    pub player_car_index: u8,

    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,

    pub session_data: SessionData,
    pub laps: Vec<LapHistoryData>,
    pub motion_data: Vec<CarMotionData>,
    pub motion_data_ex: Vec<MotionExData>
}

#[derive(Default, Debug)]
pub struct SessionData {
    pub session_type: u8,
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

impl From<PacketSessionData> for SessionData {
    fn from(value: PacketSessionData) -> Self {
        Self {
            session_type: value.session_type,
            weather: value.weather,
            track_temperature: value.track_temperature,
            air_temperature: value.air_temperature,
            total_laps: value.total_laps,
            track_id: value.track_id,
            ai_difficulty: value.ai_difficulty,
            steering_assist: value.steering_assist,
            braking_assist: value.braking_assist,
            gearbox_assist: value.gearbox_assist,
            dynamic_racing_line: value.dynamic_racing_line,
            rule_set: value.rule_set,
            session_duration: value.session_duration
        }
    }
}

#[derive(Debug)]
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

impl From<PacketMotionExData> for MotionExData {
    fn from(value: PacketMotionExData) -> Self {
        Self {
            suspension_position: value.suspension_position,
            suspension_velocity: value.suspension_velocity,
            suspension_acceleration: value.suspension_acceleration,
            wheel_speed: value.wheel_speed,
            wheel_slip_ratio: value.wheel_slip_ratio,
            wheel_slip_angle: value.wheel_slip_angle,
            wheel_lat_force: value.wheel_lat_force,
            wheel_long_force: value.wheel_long_force,
            height_of_cog_above_ground: value.height_of_cog_above_ground,
            local_velocity_x: value.local_velocity_x,
            local_velocity_y: value.local_velocity_y,
            local_velocity_z: value.local_velocity_z,
            angular_velocity_x: value.angular_velocity_x,
            angular_velocity_y: value.angular_velocity_y,
            angular_velocity_z: value.angular_velocity_z,
            angular_acceleration_x: value.angular_acceleration_x,
            angular_acceleration_y: value.angular_acceleration_y,
            angular_acceleration_z: value.angular_acceleration_z,
            front_wheels_angle: value.front_wheels_angle,
            wheel_vert_force: value.wheel_vert_force,
        }
    }
}

impl GameSession {
    pub fn new() -> Self {
        let mut s = Self::default();
        s.start_date = chrono::offset::Utc::now();
        s
    }

    pub fn handle_packet(&mut self, packet: Packet) -> () {
        let header = packet.header();

        self.player_car_index = header.player_car_index;
        self.session_uid = header.session_uid;
        match packet {
            Packet::Session(p) => {
                self.session_data = SessionData::from(p);
            }
            Packet::SessionHistory(p) => {
                if p.car_idx != self.player_car_index { return };
                self.laps = p.lap_history_data.to_vec();               
            }
            Packet::Motion(p) => {
                self.motion_data.push(p.car_motion_data[self.player_car_index as usize]);
            },
            Packet::MotionEx(p) => {
                self.motion_data_ex.push(MotionExData::from(p));
            },
            _ => {} 
        }

        info!("{:#?}", self);
    }
}