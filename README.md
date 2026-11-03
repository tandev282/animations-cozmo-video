**Cozmo animations**

This repository contains the recordings for 348 Cozmo animations (app version 1.5.0), as well as a script to run the animations. You can use these recordings for your experiments, further validation of these animations, or use the code to run/call individual animations.

Recordings  were made in Summer 2017. The complete list of the animations can be found in the anim_record.csv file. 

The animation group name (e.g., ‘ask’, ‘badword’, ‘turtleroll’, ‘hiccup’) were used to subjectively classify the animation as either social or not social. The social animations (348) were then recorded and rated by independent raters (n = 264). 

The code for this experiment can be found in the [emotion classification repository](https://github.com/cozmo4hri/emotion-classification/).

**Code**

Use the the code to call individual animations
1.	Turn Cozmo on
2.	Connect to the SDK
3.	Run a command, for example:

```python record_anim.py -index_list=97```

The full specification is:

```python record_anim.py -h (--help) [-i (--index) -n (--name) --name_list= --index_list=]```

For help add:
-h (--help)           Show the help string
                
To start from a specific point do:  
-i= (--index=)      Play all animation starting from given id  
```python record_anim.py -i=8```  
play animation starting from 'Animation number=8' from anim database  
                
-n= (--name=)       Play all animation starting from given id  
```python record_anim.py -n=anim_hiccup_01```  
play animation starting from 'Animation name=anim_hiccup_01' from anim database  

Logging arguments:  
--name_list=        Play only animation names provided. (Do not put space between animation names)   
```python record_anim.py -name_list=anim_hiccup_01,anim_dizzy_pickup_03,anim_keepaway_wingame_03```   

--index_list=       Optional last argument to ignore logging to file  
```python record_anim.py -index_list=1,6,23,189,76```  

---

### 🌐 Cozmo Animation Studio & Web Viewer (Online Streaming)

Ứng dụng web xem video và tra cứu 790 hoạt ảnh Cozmo:
- **Tối ưu dung lượng Hosting:** Thay vì phải tải và lưu toàn bộ thư mục `animation-set/` nặng **~378 MB** lên hosting, web player hỗ trợ phát trực tiếp video từ kho chính thức [cozmo4hri/animations](https://github.com/cozmo4hri/animations/tree/master/animation-set) qua CDN tốc độ cao (Cloudflare / jsDelivr).
- **Hỗ trợ 2 nguồn phát video trực tuyến từ GitHub:**
  1. **GitHub CDN (Mặc định - Khuyên dùng):** Phát video qua jsDelivr CDN với mã hóa MP4 chuẩn, hỗ trợ tua nhanh (HTTP Byte-Ranges) và lưu bộ nhớ đệm (Cache) tức thì.
  2. **GitHub Raw (Trực tiếp):** Phát trực tiếp từ raw.githubusercontent.com.
- **Tự động chuyển nguồn dự phòng:** Nếu một nguồn gặp sự cố mạng, player sẽ tự động thử nguồn thay thế để không làm gián đoạn trải nghiệm người dùng.

#### Cách chạy ứng dụng:
- **Chạy nội bộ:** Chạy lệnh `python run_viewer.py` để tự động mở giao diện trên trình duyệt.
- **Deploy lên Hosting (GitHub Pages / Vercel / Netlify):** Chỉ cần upload các file mã nguồn (`index.html`, `styles.css`, `app.js`, `data.js`, `anim_record.csv`) mà **không cần upload thư mục `animation-set/`**, giúp tiết kiệm hơn **99.9%** dung lượng hosting!

