mod car_damage;
mod car_setups;
mod car_status;
mod car_telemetry;
mod event;
mod final_classification;
mod header;
mod lap;
mod lobby_info;
mod motion;
mod motion_ex;
mod participants;
mod session;
mod session_history;
mod tyre_sets;

pub use car_damage::*;
pub use car_setups::*;
pub use car_status::*;
pub use car_telemetry::*;
pub use event::*;
pub use final_classification::*;
pub use header::*;
pub use lap::*;
pub use lobby_info::*;
pub use motion::*;
pub use motion_ex::*;
pub use participants::*;
use serde_json::Error;
pub use session::*;
pub use session_history::*;
pub use tyre_sets::*;


use serde::{Serialize, Deserialize};

#[derive(Debug, PartialEq, Clone, Serialize, Deserialize)]
pub enum PacketID {
    Motion,
    Session,
    Lap,
    Event,
    Participants,
    CarSetups,
    CarTelemetry,
    CarStatus,
    FinalClassification,
    LobbyInfo,
    CarDamage,
    SessionHistory,
    TyreSets,
    MotionEx,
}

// impl From<u8> for PacketID {
//     fn from(val: u8) -> PacketID {
//         match val {
//             0 => PacketID::Motion,
//             1 => PacketID::Session,
//             2 => PacketID::Lap,
//             3 => PacketID::Event,
//             4 => PacketID::Participants,
//             5 => PacketID::CarSetups,
//             6 => PacketID::CarTelemetry,
//             7 => PacketID::CarStatus,
//             8 => PacketID::FinalClassification,
//             9 => PacketID::LobbyInfo,
//             10 => PacketID::CarDamage,
//             11 => PacketID::SessionHistory,
//             12 => PacketID::TyreSets,
//             13 => PacketID::MotionEx,
//             // Something catastrophic has gone wrong if this panics
//             // (just saying)
//             _ => panic!("Invalid packet ID"),
//         }
//     }
// }

impl TryFrom<u8> for PacketID {
    type Error = PacketError;

    fn try_from(val: u8) -> Result<Self, Self::Error> {
        match val {
            0 => Ok(PacketID::Motion),
            1 => Ok(PacketID::Session),
            2 => Ok(PacketID::Lap),
            3 => Ok(PacketID::Event),
            4 => Ok(PacketID::Participants),
            5 => Ok(PacketID::CarSetups),
            6 => Ok(PacketID::CarTelemetry),
            7 => Ok(PacketID::CarStatus),
            8 => Ok(PacketID::FinalClassification),
            9 => Ok(PacketID::LobbyInfo),
            10 => Ok(PacketID::CarDamage),
            11 => Ok(PacketID::SessionHistory),
            12 => Ok(PacketID::TyreSets),
            13 => Ok(PacketID::MotionEx),
            // Something catastrophic has gone wrong if this panics
            // (just saying)
            _ => Err(PacketError::InvalidPacketID(val)),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum Packet {
    // Header should only be decoded by itself in testing
    // it is mainly provided here for the sake of completeness
    Header(header::PacketHeader),
    Motion(motion::PacketMotionData),
    Session(session::PacketSessionData),
    Lap(lap::PacketLapData),
    Event(event::PacketEventData),
    Participants(participants::PacketParticipantsData),
    CarSetups(car_setups::PacketCarSetupData),
    CarTelemetry(car_telemetry::PacketCarTelemetryData),
    CarStatus(car_status::PacketCarStatusData),
    FinalClassification(final_classification::PacketFinalClassificationData),
    LobbyInfo(lobby_info::PacketLobbyInfoData),
    CarDamage(car_damage::PacketCarDamageData),
    SessionHistory(session_history::PacketSessionHistoryData),
    TyreSets(tyre_sets::PacketTyreSetData),
    MotionEx(motion_ex::PacketMotionExData)
}

#[derive(Debug)]
pub enum PacketError {
    SerialisationError(Box<bincode::ErrorKind>),
    InvalidPacketID(u8),
    EventCodeOutOfBounds(usize),
    EventDecodeError(),
}

impl std::fmt::Display for PacketError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            PacketError::SerialisationError(e) => write!(f, "Serialisation error: {:#?}", e),
            PacketError::InvalidPacketID(id) => write!(f, "Invalid packet ID: {}", id),
            PacketError::EventCodeOutOfBounds(id) => {
                write!(f, "Event code of length {} is out of bounds", id)
            }
            PacketError::EventDecodeError() => write!(f, "Failed to decode event data"),
        }
    }
}

pub trait FromBytes {
    fn from_bytes(buf: &[u8]) -> Result<Self, PacketError>
    where
        Self: Sized;
}

pub trait ToJSON<T: Serialize> {
    fn to_json(value: &T) -> Result<String, Error> {
        serde_json::to_string(value)
    }
}

pub trait PacketAttributes {
    fn header(&self) -> header::PacketHeader;
    fn packet_id(&self) -> Result<PacketID, PacketError>;
}

// allows usage of `?` operator with `PacketError`
impl From<Box<bincode::ErrorKind>> for PacketError {
    fn from(e: Box<bincode::ErrorKind>) -> Self {
        PacketError::SerialisationError(e)
    }
}

impl FromBytes for Packet {
    fn from_bytes(buf: &[u8]) -> Result<Packet, PacketError> {
        let header = header::PacketHeader::from_bytes(buf)?;

        match PacketID::try_from(header.packet_id) {
            Ok(PacketID::Motion) => Ok(Packet::Motion(motion::PacketMotionData::from_bytes(buf)?)),
            Ok(PacketID::Session) => Ok(Packet::Session(session::PacketSessionData::from_bytes(buf)?)),
            Ok(PacketID::Lap) => Ok(Packet::Lap(lap::PacketLapData::from_bytes(buf)?)),
            Ok(PacketID::Event) => Ok(Packet::Event(event::PacketEventData::from_bytes(buf)?)),
            Ok(PacketID::Participants) => Ok(Packet::Participants(participants::PacketParticipantsData::from_bytes(
                buf,
            )?)),
            Ok(PacketID::CarSetups) => Ok(Packet::CarSetups(car_setups::PacketCarSetupData::from_bytes(buf)?)),
            Ok(PacketID::CarTelemetry) => Ok(Packet::CarTelemetry(car_telemetry::PacketCarTelemetryData::from_bytes(
                buf,
            )?)),
            Ok(PacketID::CarStatus) => Ok(Packet::CarStatus(car_status::PacketCarStatusData::from_bytes(buf)?)),
            Ok(PacketID::FinalClassification) => Ok(Packet::FinalClassification(
                final_classification::PacketFinalClassificationData::from_bytes(buf)?,
            )),
            Ok(PacketID::LobbyInfo) => Ok(Packet::LobbyInfo(lobby_info::PacketLobbyInfoData::from_bytes(buf)?)),
            Ok(PacketID::CarDamage) => Ok(Packet::CarDamage(car_damage::PacketCarDamageData::from_bytes(buf)?)),
            Ok(PacketID::SessionHistory) => Ok(Packet::SessionHistory(
                session_history::PacketSessionHistoryData::from_bytes(buf)?,
            )),
            Ok(PacketID::TyreSets) => Ok(Packet::TyreSets(tyre_sets::PacketTyreSetData::from_bytes(buf)?)),
            Ok(PacketID::MotionEx) => Ok(Packet::MotionEx(motion_ex::PacketMotionExData::from_bytes(buf)?)),
            Err(e) => Err(e)
        }
    }
}

impl PacketAttributes for Packet {
    fn header(&self) -> header::PacketHeader {
        match self {
            Packet::Header(header) => header.clone(),
            Packet::Motion(data) => data.header(),
            Packet::Session(data) => data.header(),
            Packet::Lap(data) => data.header(),
            Packet::Event(data) => data.header(),
            Packet::Participants(data) => data.header(),
            Packet::CarSetups(data) => data.header(),
            Packet::CarTelemetry(data) => data.header(),
            Packet::CarStatus(data) => data.header(),
            Packet::FinalClassification(data) => data.header(),
            Packet::LobbyInfo(data) => data.header(),
            Packet::CarDamage(data) => data.header(),
            Packet::SessionHistory(data) => data.header(),
            Packet::TyreSets(data) => data.header(),
            Packet::MotionEx(data) => data.header(),
        }
    }

    fn packet_id(&self) -> Result<PacketID, PacketError> {
        match self {
            Packet::Header(header) => header.packet_id(),
            Packet::Motion(data) => data.packet_id(),
            Packet::Session(data) => data.packet_id(),
            Packet::Lap(data) => data.packet_id(),
            Packet::Event(data) => data.packet_id(),
            Packet::Participants(data) => data.packet_id(),
            Packet::CarSetups(data) => data.packet_id(),
            Packet::CarTelemetry(data) => data.packet_id(),
            Packet::CarStatus(data) => data.packet_id(),
            Packet::FinalClassification(data) => data.packet_id(),
            Packet::LobbyInfo(data) => data.packet_id(),
            Packet::CarDamage(data) => data.packet_id(),
            Packet::SessionHistory(data) => data.packet_id(),
            Packet::TyreSets(data) => data.packet_id(),
            Packet::MotionEx(data) => data.packet_id(),
        }
    }
}