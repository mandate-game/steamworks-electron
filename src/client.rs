use std::sync::{LazyLock, Mutex};
use steamworks::Client;

static STEAM_CLIENT: LazyLock<Mutex<Option<Client>>> = LazyLock::new(|| Mutex::new(None));

pub fn has_client() -> bool {
    STEAM_CLIENT.lock().unwrap().is_some()
}

pub fn get_client() -> Client {
    let option = STEAM_CLIENT.lock().unwrap().to_owned();
    option.unwrap()
}

pub fn set_client(client: Client) {
    let mut client_ref = STEAM_CLIENT.lock().unwrap();
    *client_ref = Some(client);
}

pub fn drop_client() {
    let mut client_ref = STEAM_CLIENT.lock().unwrap();
    *client_ref = None;
}
