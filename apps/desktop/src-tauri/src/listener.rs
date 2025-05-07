use std::sync::Arc;

use tauri::Wry;
use tauri_plugin_store::{Store, StoreExt};
use tokio::net::{ToSocketAddrs, UdpSocket};
use telemetry::{session::Session as TelemetrySession, EventDataDetails, FromBytes, Packet};
use crate::telemetry_session::{self, PacketHandler};

use log::{debug, error};

#[tauri::command]
pub async fn listen_for_telemetry(app_handle: tauri::AppHandle, addr: String) -> Result<(), String> {
    let store = app_handle.store("credentials.json").map_err(|err| err.to_string())?;

    let mut listener = UDPListener::new(&addr, &store).await?;
    listener.listen().await
}

pub struct UDPListener<'a> {
    pub store: &'a Arc<Store<Wry>>,
    pub socket: UdpSocket,
    pub current_session: Option<TelemetrySession>
}

impl<'a> UDPListener<'a> {
    pub async fn new<T: ToSocketAddrs>(addr: T, store: &'a Arc<Store<Wry>>) -> Result<Self, String> {
        match UdpSocket::bind(addr).await.map_err(|err| err.to_string()) {
            Ok(socket) => Ok(Self { socket, current_session: None, store }),
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
                            s.handle_packet(packet, self.store).await;
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
                        
                        let mut triesLeft = 5;
                        let mut requestError = None;
                        while triesLeft > 0  {
                            match telemetry_session::end_session(self.current_session.as_mut().unwrap(), self.store).await {
                                Ok(_) => {
                                    self.current_session = None;
                                    return;
                                },
                                Err(e) => {
                                    requestError = Some(e);
                                    triesLeft = triesLeft - 1;
                                }
                            };
                        }
                        debug!("Failed to end session 5 times! Error: {:#?}", requestError)
                    },
                    _ => ()
                }
            },
            _ => ()
        }
    }
}