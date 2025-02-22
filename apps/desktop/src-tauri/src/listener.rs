use tokio::net::{ToSocketAddrs, UdpSocket};
use telemetry::{session::Session as TelemetrySession, EventDataDetails, FromBytes, Packet};
use crate::telemetry_session::{self, PacketHandler};

use log::{error, info};

#[tauri::command]
pub async fn listen_for_telemetry(addr: String) -> Result<(), String> {
    let mut listener = UDPListener::new(&addr).await?;
    listener.listen().await
}

pub struct UDPListener {
    pub socket: UdpSocket,
    pub current_session: Option<TelemetrySession>
}

impl UDPListener {
    pub async fn new<T: ToSocketAddrs>(addr: T) -> Result<Self, String> {
        match UdpSocket::bind(addr).await.map_err(|err| err.to_string()) {
            Ok(socket) => Ok(Self { socket, current_session: None }),
            Err(err) => Err(err)
        }
    }

    pub async fn listen(&mut self) -> Result<(), String> {
        let mut buf = vec![0; 2048];
        loop {
            let (len, _addr) = self.socket.recv_from(&mut buf).await.map_err(|err| err.to_string())?;
    
            match Packet::from_bytes(&buf[..len]) {
                Ok(packet) => {
                    self.handle_packet(packet).await;

                    match &mut self.current_session {
                        Some(s) => {
                            s.handle_packet(packet).await;
                        },
                        _ => {}
                    }
                }
                Err(e) => {
                    error!("{e}");
                }
            }
        }
    }

    pub async fn handle_packet(&mut self, packet: Packet) -> () {
        match packet {
            Packet::Event(p) => {
                match p.event_details {
                    EventDataDetails::SessionStarted => self.current_session = Some(TelemetrySession::new(p.header)),
                    EventDataDetails::SessionEnded => {
                        if self.current_session.is_none() {
                            return;
                        }
                        
                        telemetry_session::end_session(self.current_session.as_mut().unwrap()).await.unwrap();
                        self.current_session = None;
                    },
                    _ => ()
                }
            },
            _ => ()
        }
    }
}