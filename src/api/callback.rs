use napi_derive::napi;

#[napi]
pub mod callback {
    use napi::Error;
    use napi::bindgen_prelude::{FnArgs, Function};
    use napi::threadsafe_function::ThreadsafeFunctionCallMode;

    #[napi]
    pub struct Handle {
        handle: Option<steamworks::CallbackHandle>,
    }

    #[napi]
    impl Handle {
        #[napi]
        pub fn disconnect(&mut self) {
            // CallbackHandle unregisters the Steam callback when dropped.
            // steamworks-rs 0.13 removed the explicit disconnect() method.
            self.handle.take();
        }
    }

    #[napi]
    pub enum SteamCallback {
        PersonaStateChange,
        SteamServersConnected,
        SteamServersDisconnected,
        SteamServerConnectFailure,
        LobbyDataUpdate,
        LobbyChatUpdate,
        P2PSessionRequest,
        P2PSessionConnectFail,
        GameLobbyJoinRequested,
        MicroTxnAuthorizationResponse,
    }

    #[napi(ts_generic_types = "C extends keyof import('./callbacks').CallbackReturns")]
    pub fn register(
        #[napi(ts_arg_type = "C")] steam_callback: SteamCallback,
        #[napi(ts_arg_type = "(value: import('./callbacks').CallbackReturns[C]) => void")]
        handler: Function<FnArgs<(serde_json::Value,)>, ()>,
    ) -> Result<Handle, Error> {
        let threadsafe_handler = handler
            .build_threadsafe_function()
            .callee_handled::<false>()
            .build()?;

        let call = move |value: serde_json::Value| {
            threadsafe_handler.call((value,).into(), ThreadsafeFunctionCallMode::Blocking);
        };

        let handle = match steam_callback {
            SteamCallback::PersonaStateChange => {
                register_callback::<steamworks::PersonaStateChange>(call)
            }
            SteamCallback::SteamServersConnected => {
                register_callback::<steamworks::SteamServersConnected>(call)
            }
            SteamCallback::SteamServersDisconnected => {
                register_callback::<steamworks::SteamServersDisconnected>(call)
            }
            SteamCallback::SteamServerConnectFailure => {
                register_callback::<steamworks::SteamServerConnectFailure>(call)
            }
            SteamCallback::LobbyDataUpdate => {
                register_callback::<steamworks::LobbyDataUpdate>(call)
            }
            SteamCallback::LobbyChatUpdate => {
                register_callback::<steamworks::LobbyChatUpdate>(call)
            }
            SteamCallback::P2PSessionRequest => {
                register_callback::<steamworks::P2PSessionRequest>(call)
            }
            SteamCallback::P2PSessionConnectFail => {
                register_callback::<steamworks::P2PSessionConnectFail>(call)
            }
            SteamCallback::GameLobbyJoinRequested => {
                register_callback::<steamworks::GameLobbyJoinRequested>(call)
            }
            SteamCallback::MicroTxnAuthorizationResponse => {
                register_callback::<steamworks::MicroTxnAuthorizationResponse>(call)
            }
        };

        Ok(Handle {
            handle: Some(handle),
        })
    }

    fn register_callback<C>(
        mut threadsafe_handler: impl FnMut(serde_json::Value) + Send + 'static,
    ) -> steamworks::CallbackHandle
    where
        C: steamworks::Callback + serde::Serialize,
    {
        let client = crate::client::get_client();
        client.register_callback(move |value: C| {
            let value = serde_json::to_value(&value).unwrap();
            threadsafe_handler(value);
        })
    }
}
