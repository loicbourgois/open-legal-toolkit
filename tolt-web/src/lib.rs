mod utils;


use wasm_bindgen::prelude::*;


use serde;


#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}


macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}


#[wasm_bindgen]
#[derive(serde::Serialize, Debug)]
pub struct Data {
    tick: u32,
}


#[wasm_bindgen]
pub fn new_data() -> Data {
    Data {
        tick: 0
    }
}


#[wasm_bindgen]
impl Data {
    pub fn to_json_str(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }
}
