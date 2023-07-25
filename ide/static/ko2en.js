let lang = localStorage.getItem("language")?localStorage.getItem("language"):"ko";

const translations = {
  password: {
    ko: "비밀번호",
    en: "Password"
  },
  internet_settings: {
    ko: "인터넷 설정",
    en: "Internet settings"
  },
  wifi_name: {
    ko: "Wifi 이름",
    en: "Wifi Name"
  },
  confirm: {
    ko: "확인",
    en: "Confirm"
  },
  reset: {
    ko: "초기화",
    en: "Reset"
  },
  wifi_signal: {
    ko: "신호세기",
    en: "Signal"
  },
  wifi_psk: {
    ko: "암호화방식",
    en: "Encryption"
  },
  usedata: {
    ko: "사용성 데이터",
    en: "Used Data"
  },
  confirm_wifi: {
    ko: "\n\n로봇의 Wifi 정보를 변경하시겠습니까?\nWifi 정보를 한번 더 확인하시기 바랍니다.\n(잘못된 정보 입력 시, 심각한 오류가 발생할 수 있습니다.)",
    en: "\n\nAre you sure you want to change the wifi information of the robot?\nPlease check the wifi information once more.\n(Serious errors may occur if you enter incorrect information.)"
  },
  move_to_tool: {
    ko: "Tools로 이동하시겠습니까?",
    en: "Are you sure you want to go to Tools?"
  },
  file_error: {
    ko: "파일전송 오류",
    en: "File Transfer error."
  },
  file_ok: {
    ko: "파일전송 완료",
    en: "File transfer ok."
  },
  nofile: {
    ko: "파일없음.",
    en: "No file found."
  },
  not_load_block: {
    ko: "블록 데이터를 불러오지 못했습니다.",
    en: "Failed to load block data."
  },
  not_move_parent: {
    ko: "더이상 상위 폴더로 이동할 수 없습니다.",
    en: "Cannot move further up in the folder hierarchy"
  },
  confirm_load_file: {
    ko: ( filepath ) => { return `${filepath} 파일을 불러오겠습니까?` },
    en: ( filepath ) => { return `Would you like to load ${filepath}?` }
  },
  confirm_save_file: {
    ko: ( filepath ) => { return `${filepath} 파일을 저장하지 않았습니다. 저장하시겠습니까?` },
    en: ( filepath ) => { return `${filepath} not saved.Would you like to save it?` }
  },
  confirm_delete_file: {
    ko: ( filepath ) => { return `${filepath} 파일 또는 폴더를 삭제하시겠습니까?` },
    en: ( filepath ) => { return `Are you sure you want to delete the file or folder ${filepath}?` }
  },
  check_newfolder_name: {
    ko: "새폴더의 이름을 입력하세요.",
    en: "Enter a name for the new folder."
  },
  check_newfile_name: {
    ko: "새파일의 이름을 입력하세요.",
    en: "Enter a name for the new file."
  },
  name_size_limit: {
    ko: (max_limit) => { return ` (${max_limit}자 이하로 입력해주세요.)`},
    en: (max_limit) => { return `Enter within ${max_limit} characters or less.`}
  },
  upload: {
    ko: "업로드",
    en: "Upload"
  },
  add_directory: {
    ko: "새폴더",
    en: "Add directory"
  },
  add_file: {
    ko: "새파일",
    en: "Add file"
  },
  python: {
    ko: "파이썬",
    en: "Python"
  },
  block: {
    ko: "블록",
    en: "Block"
  },
  shell: {
    ko: "쉘",
    en: "Shell"
  },

  execute: {
    ko: "실행",
    en: "Execute"
  },
  stop: {
    ko: "정지",
    en: "Stop"
  },
  save : {
    ko: "저장",
    en: "Save"
  },
  reset: {
    ko: "초기화",
    en: "Reset"
  },
  logic: {
    ko: "논리",
    en: "Logic"
  },
  loops: {
    ko: "반복",
    en: "Loops"
  },
  math: {
    ko: "수학",
    en: "Math"
  },
  text: {
    ko: "문자",
    en: "Text"
  },
  lists: {
    ko: "목록",
    en: "Lists"
  },
  colour: {
    ko: "색상",
    en: "Colour"
  },
  variables: {
    ko: "변수",
    en: "Var"
  },
  functions: {
    ko: "함수",
    en: "Funcs"
  },
  audio: {
    ko: "소리",
    en: "Audio"
  },
  collect: {
    ko: "수집",
    en: "Collect"
  },
  device: {
    ko: "장치",
    en: "Device"
  },
  motion: {
    ko: "동작",
    en: "Motion"
  },
  oled: {
    ko: "화면",
    en: "Oled"
  },
  speech: {
    ko: "음성",
    en: "Speech"
  },
  vision: {
    ko: "시각",
    en: "Vision"
  },
  utils: {
    ko: "도구",
    en: "Utils"
  },
  mymotion: {
    ko: "나의 모션",
    en: "my motion"
  },
  image_filename: {
    ko: "이미지 파일이름",
    en: "image filename"
  },
  audio_filename: {
    ko: "오디오 파일이름",
    en: "audio filename"
  }
};