# Cozmo Animations & Animation Studio

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2ea44f?style=for-the-badge&logo=github)](https://tandev282.github.io/animations-cozmo-video/)
[![Animations](https://img.shields.io/badge/Total_Animations-790-blue?style=for-the-badge)](https://tandev282.github.io/animations-cozmo-video/)
[![Videos](https://img.shields.io/badge/Recorded_Videos-348-orange?style=for-the-badge)](https://tandev282.github.io/animations-cozmo-video/)

> 🚀 **Trải nghiệm nhanh ứng dụng trực tuyến (Live Demo):**  
> 👉 [**https://tandev282.github.io/animations-cozmo-video/**](https://tandev282.github.io/animations-cozmo-video/)  
> *(Xem và tra cứu trực tiếp toàn bộ 790 animations & 348 video streaming tốc độ cao mà không cần cài đặt)*

This repository contains the recordings for 348 Cozmo animations (app version 1.5.0), the database of all 790 animations, Python SDK scripts to run animations on a physical Cozmo robot, and a modern Web Studio & Video Viewer.

Recordings were made in Summer 2017. The complete list of animations can be found in [`data/anim_record.csv`](data/anim_record.csv).

The animation group name (e.g., ‘ask’, ‘badword’, ‘turtleroll’, ‘hiccup’) were used to subjectively classify the animation as either social or not social. The social animations (348) were then recorded and rated by independent raters (n = 264). 

The code for this experiment can be found in the [emotion classification repository](https://github.com/cozmo4hri/emotion-classification/).

---

## 📁 Cấu trúc thư mục dự án

```
animations-cozmo-video/
├── assets/
│   ├── css/
│   │   └── styles.css          # Giao diện CSS hiện đại cho Cozmo Studio
│   └── js/
│       ├── app.js              # Mã JavaScript điều khiển Web Player & bộ lọc
│       └── data.js             # Cơ sở dữ liệu 790 animation (JSON tĩnh nạp nhanh)
├── data/
│   └── anim_record.csv         # Tập tin dữ liệu gốc toàn bộ hoạt ảnh Cozmo
├── scripts/
│   ├── build_data.py           # Tiện ích chuyển đổi data/anim_record.csv sang assets/js/data.js
│   └── record_anim.py          # Script kết nối và gọi hoạt ảnh trên robot Cozmo qua Python SDK
├── index.html                  # Trang giao diện chính Web Viewer (tương thích GitHub Pages)
├── run_viewer.py               # Tiện ích chạy Local Web Server & tự động mở trình duyệt
├── README.md                   # Tài liệu hướng dẫn sử dụng
└── LICENSE                     # Giấy phép mã nguồn
```

---

## 🌐 Cozmo Animation Studio & Web Viewer (Online Streaming)

👉 **Truy cập trực tiếp tại:** [**https://tandev282.github.io/animations-cozmo-video/**](https://tandev282.github.io/animations-cozmo-video/)

Ứng dụng web xem video và tra cứu 790 hoạt ảnh Cozmo:
- **Tối ưu dung lượng Hosting:** Thay vì phải tải và lưu toàn bộ thư mục `animation-set/` nặng **~378 MB** lên hosting, web player hỗ trợ phát trực tiếp video từ kho chính thức [cozmo4hri/animations](https://github.com/cozmo4hri/animations/tree/master/animation-set) qua CDN tốc độ cao (Cloudflare / jsDelivr).
- **Hỗ trợ 2 nguồn phát video trực tuyến từ GitHub:**
  1. **GitHub CDN (Mặc định - Khuyên dùng):** Phát video qua jsDelivr CDN với mã hóa MP4 chuẩn, hỗ trợ tua nhanh (HTTP Byte-Ranges) và lưu bộ nhớ đệm (Cache) tức thì.
  2. **GitHub Raw (Trực tiếp):** Phát trực tiếp từ raw.githubusercontent.com.
- **Tự động chuyển nguồn dự phòng:** Nếu một nguồn gặp sự cố mạng, player sẽ tự động thử nguồn thay thế để không làm gián đoạn trải nghiệm người dùng.

### Cách sử dụng & Chạy ứng dụng:
- **Trải nghiệm Online (GitHub Pages):** Mở link [tandev282.github.io/animations-cozmo-video](https://tandev282.github.io/animations-cozmo-video/) trên bất kỳ trình duyệt nào (không cần cài đặt gì thêm).
- **Chạy nội bộ (Offline/Local):** Chạy lệnh:
  ```bash
  python run_viewer.py
  ```
  Máy chủ nội bộ sẽ tự động khởi động và mở giao diện trên trình duyệt tại `http://localhost:8000/index.html`.
- **Deploy lên Hosting (GitHub Pages / Vercel / Netlify):** 
  - **GitHub Pages:** Do `index.html` nằm ở thư mục gốc, chỉ cần kích hoạt GitHub Pages từ nhánh `main` (chọn root `/`) là trang web sẽ tự động build và online!
  - **Vercel / Netlify:** Kết nối repository và deploy trực tiếp mà không cần cấu hình build step.
  - Không cần lưu trữ video trên host giúp tiết kiệm hơn **99.9%** dung lượng!

### Cập nhật dữ liệu Web khi sửa CSV:
Nếu bạn chỉnh sửa file `data/anim_record.csv`, chạy lệnh sau để tái tạo lại file `assets/js/data.js`:
```bash
python scripts/build_data.py
```

---

## 🤖 Điều khiển Robot Cozmo qua Python SDK

Sử dụng script `scripts/record_anim.py` để kết nối và gọi hoạt ảnh trực tiếp trên robot Cozmo:
1. Bật nguồn Cozmo
2. Kết nối tới Cozmo Python SDK
3. Chạy lệnh:

```bash
python scripts/record_anim.py -index_list=97
```

### Chi tiết các tham số dòng lệnh:

```bash
python scripts/record_anim.py -h (--help) [-i (--index) -n (--name) --name_list= --index_list=]
```

- `-h (--help)`: Hiển thị hướng dẫn sử dụng.
- `-i= (--index=)`: Phát hoạt ảnh bắt đầu từ ID cụ thể:
  ```bash
  python scripts/record_anim.py -i=8
  ```
- `-n= (--name=)`: Phát hoạt ảnh theo tên:
  ```bash
  python scripts/record_anim.py -n=anim_hiccup_01
  ```
- `--name_list=`: Phát danh sách các hoạt ảnh theo tên (không có dấu cách):
  ```bash
  python scripts/record_anim.py -name_list=anim_hiccup_01,anim_dizzy_pickup_03,anim_keepaway_wingame_03
  ```
- `--index_list=`: Phát danh sách các hoạt ảnh theo ID:
  ```bash
  python scripts/record_anim.py -index_list=1,6,23,189,76
  ```
