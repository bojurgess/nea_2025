use tokio::net::{ToSocketAddrs, UdpSocket};

#[tauri::command]
pub async fn listen_for_telemetry(addr: String) -> Result<(), String> {
    let listener = UDPListener::new(&addr).await?;
    listener.listen().await
}

pub struct UDPListener {
    pub socket: UdpSocket
}

impl UDPListener {
    pub async fn new<T: ToSocketAddrs>(addr: T) -> Result<Self, String> {
        match UdpSocket::bind(addr).await.map_err(|err| err.to_string()) {
            Ok(socket) => Ok(Self { socket }),
            Err(err) => Err(err)
        }
    }

    pub async fn listen(&self) -> Result<(), String> {
        let mut buf = vec![0; 2048];
        loop {
            let (len, addr) = self.socket.recv_from(&mut buf).await.map_err(|err| err.to_string())?;
        }
    }
}