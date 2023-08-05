// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;

#[tauri::command]
async fn set_icon(icns_name: &str, icns_url: &str) -> Result<String, String> {
    let result = reqwest::get(icns_url).await
        .expect("请求失败")
        .bytes().await
        .expect("获取字节失败");

    let home_dir = std::env::var("HOME").expect("获取HOME失败");
    let mut file = std::fs::File::create(format!("{}/Downloads/{}.icns", home_dir, icns_name)).expect("创建文件失败");
    file.write_all(result.as_ref()).expect("写入失败");
    Ok("success".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_icon])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
