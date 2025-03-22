use crate::{PacketCarStatusData, PacketSessionData};

#[derive(Debug, Default, Hash, Clone)]
pub struct Assists {
        /// Steering assist (0 = off, 1 = on).
        pub steering_assist: Option<u8>,
        /// Braking assist:
        /// - 0 = off
        /// - 1 = low
        /// - 2 = medium
        /// - 3 = high
        pub braking_assist: Option<u8>,
        /// Gearbox assist:
        /// - 1 = manual
        /// - 2 = manual & suggested gear
        /// - 3 = auto
        pub gearbox_assist: Option<u8>,
        /// Pit assist (0 = off, 1 = on).
        pub pit_assist: Option<u8>,
        /// Pit release assist (0 = off, 1 = on).
        pub pit_release_assist: Option<u8>,
        /// ERS assist (0 = off, 1 = on).
        pub ers_assist: Option<u8>,
        /// DRS assist (0 = off, 1 = on).
        pub drs_assist: Option<u8>,
        /// Dynamic racing line:
        /// - 0 = off
        /// - 1 = corners only
        /// - 2 = full
        pub dynamic_racing_line: Option<u8>,
        /// Traction control level (0 = off, 1 = medium, 2 = full)
        pub traction_control: Option<u8>,
        /// ABS (0 = off, 1 = on)
        pub anti_lock_brakes: Option<bool>,
}

impl Assists {
    pub fn from_session(p: PacketSessionData) -> Assists {
        Assists {
            steering_assist: Some(p.steering_assist),
            braking_assist: Some(p.braking_assist),
            gearbox_assist: Some(p.gearbox_assist),
            pit_assist: Some(p.pit_assist),
            pit_release_assist: Some(p.pit_release_assist),
            ers_assist: Some(p.ers_assist),
            drs_assist: Some(p.drs_assist),
            dynamic_racing_line: Some(p.dynamic_racing_line),
            traction_control: None,
            anti_lock_brakes: None
        }
    }
    
    pub fn from_car_status(p: PacketCarStatusData, car_index: u8) -> Self {
        Self {
            steering_assist: None,
            braking_assist: None,
            gearbox_assist: None,
            pit_assist: None,
            pit_release_assist: None,
            ers_assist: None,
            drs_assist: None,
            dynamic_racing_line: None,
            traction_control: Some(p.car_status_data[car_index as usize].traction_control),
            anti_lock_brakes: Some(p.car_status_data[car_index as usize].anti_lock_brakes)
        }
    }

    pub fn is_initialised(&self) -> bool {
        self.steering_assist.is_some() || self.braking_assist.is_some() || self.gearbox_assist.is_some() ||
        self.pit_assist.is_some() || self.pit_release_assist.is_some() || self.ers_assist.is_some() ||
        self.drs_assist.is_some() || self.dynamic_racing_line.is_some() || self.traction_control.is_some() ||
        self.anti_lock_brakes.is_some()
    }

    pub fn get_mask(&self) -> Result<u16, &'static str> {
        match self.is_initialised() {
            true => {
                let mut mask: u16 = 0b0000_0000_0000_0000_0000;
                mask |= (self.steering_assist.expect("Assists are not initialised!")) as u16;
                mask |= (self.braking_assist.expect("Assists are not initialised!") as u16) << 1;
                mask |= (self.gearbox_assist.expect("Assists are not initialised!") as u16) << 3;
                mask |= (self.pit_assist.expect("Assists are not initialised!") as u16) << 5;
                mask |= (self.pit_release_assist.expect("Assists are not initialised!") as u16) << 6;
                mask |= (self.ers_assist.expect("Assists are not initialised!") as u16) << 7;
                mask |= (self.drs_assist.expect("Assists are not initialised!") as u16) << 8;
                mask |= (self.dynamic_racing_line.expect("Assists are not initialised!") as u16) << 10;
                mask |= (self.traction_control.expect("Assists are not initialised!") as u16) << 12;
                mask |= (self.anti_lock_brakes.expect("Assists are not initialised!") as u16) << 13;
        
                Ok(mask)
            },
            false => { Err("Assists are not initialised!") }
        }
    }

    pub fn decode_assist(&self, assist: &str) -> Result<u8, &str> {
        let mask = self.get_mask()?;
        match assist {
            "steering_assist" => Ok((mask & 0b0000_0000_0000_0001) as u8),
            "braking_assist" => Ok((mask & 0b0000_0000_0000_0110) as u8),
            "gearbox_assist" => Ok((mask & 0b0000_0000_0001_1000) as u8),
            "pit_assist" => Ok((mask & 0b0000_0000_0010_0000) as u8),
            "pit_release_assist" => Ok((mask & 0b0000_0000_0100_0000) as u8),
            "ers_assist" => Ok((mask & 0b0000_0000_1000_0000) as u8),
            "drs_assist" => Ok((mask & 0b0000_0001_0000_0000) as u8),
            "racing_line" => Ok((mask & 0b0000_0110_0000_0000) as u8),
            "traction_control" => Ok((mask & 0b0001_1000_0000_0000) as u8),
            "anti_lock_brakes" => Ok((mask & 0b0010_0000_0000_0000) as u8),
            _ => Err("Unknown assist was supplied")
        }
    }
}