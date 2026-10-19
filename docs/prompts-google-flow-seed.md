# Hướng Dẫn & Bộ Prompts Google Flow / Imagen 3 — Seed Sản Phẩm Danh Mục Nổi Bật

Tài liệu này cung cấp toàn bộ 144 prompts sinh ảnh chất lượng cao chuẩn thương mại điện tử (Commercial E-Commerce Photography) dành cho công cụ **Google Flow / Google Imagen 3**.

Bộ prompts bao gồm **6 Danh mục nổi bật** trên trang chủ Bento Grid, mỗi danh mục gồm **6 sản phẩm flagship** đại diện (tổng cộng **36 sản phẩm**). Mỗi sản phẩm sở hữu **1 ảnh chính (Hero Shot)** và **3 ảnh phụ (Macro Detail, Profile Angle, Lifestyle Context)**.

---

## 1. Quy Chuẩn Đặt Tên & Thư Mục Ảnh

Khi tải ảnh sinh từ Google Flow về, hãy lưu theo cấu trúc tệp để backend và frontend tự động nhận diện:

```text
uploads/
  products/
    {slug}-main.jpg                     # Ảnh chính (Hero studio)
    gallery/
      {slug}-detail.jpg                 # Ảnh phụ 1: Cận cảnh chi tiết vật liệu & linh kiện
      {slug}-angle.jpg                  # Ảnh phụ 2: Góc nghiêng / Cạnh bên / Khối cấu trúc
      {slug}-lifestyle.jpg              # Ảnh phụ 3: Bối cảnh không gian sống sang trọng
```

*Frontend tự động ánh xạ đường dẫn `products/...` thành `/uploads/products/...` hoặc liên kết trực tiếp tới Supabase Storage khi deploy.*

---

## 2. Thông Số Cấu Hình Chuẩn Trên Google Flow / Imagen 3

- **Aspect Ratio**: 
  - Ảnh chính (`main`): `1:1` (Vuông) hoặc `4:5` (Tỉ lệ chuẩn Card sản phẩm ShopViet)
  - Ảnh phụ (`gallery`): `1:1` hoặc `4:3`
- **Phong cách nghệ thuật (Style)**: Commercial Product Studio Photography, Minimalist Tech Editorial, Apple & Scandinavian Design Aesthetic.
- **Ánh sáng (Lighting)**: Softbox diffused studio lights, gentle rim light, subtle natural drop shadows, zero harsh glare.

---

## 3. Danh Sách Prompts Chi Tiết Cho 36 Sản Phẩm

---

### DANH MỤC 1: LAPTOP & TABLET (Category Slug: `laptop`)

#### 1. MacBook Pro 16 inch M3 Max
- **Slug**: `macbook-pro-16-inch-m3-max-36gb-1tb`
- **Ảnh Chính (`macbook-pro-16-inch-m3-max-main.jpg`)**:
  > *Commercial studio product photography of an Apple MacBook Pro 16-inch in Space Black finish. The laptop is open at a 110-degree angle, showing a glowing Liquid Retina XDR display with a sleek colorful wallpaper. Placed on a minimalist dark matte concrete pedestal. Soft dual diffused studio lighting, subtle rim light highlighting the anodized aluminum edge, perfectly centered, tack sharp focus, 8k resolution, Hasselblad medium format camera aesthetic.*
- **Ảnh Phụ 1 — Cận Cảnh Phím & Bản Lề (`macbook-pro-16-inch-m3-max-detail.jpg`)**:
  > *Extreme macro close-up of the MacBook Pro 16-inch Space Black keyboard and Touch ID button. Detailed texture of matte black keycaps, laser-engraved white typography, subtle backlighting beneath keys, machined unibody aluminum chamfered edge, shallow depth of field, f/2.8 macro photography, cinematic lighting.*
- **Ảnh Phụ 2 — Góc Nghiêng Cổng Kết Nối (`macbook-pro-16-inch-m3-max-angle.jpg`)**:
  > *Side profile 45-degree isometric view of MacBook Pro 16-inch closed flat on a white reflective acrylic surface. Clear focus on the MagSafe 3 port, Thunderbolt 4 USB-C ports, and HDMI slot. Crisp aluminum geometry, precision milled ports, elegant soft shadows, studio white backdrop.*
- **Ảnh Phụ 3 — Không Gian Làm Việc (`macbook-pro-16-inch-m3-max-lifestyle.jpg`)**:
  > *Editorial architectural lifestyle photography of a MacBook Pro 16-inch placed on an organic solid oak designer desk. In the background, a soft warm desk lamp, an artisan ceramic coffee mug, and a clean minimalist architectural loft studio with floor-to-ceiling windows, natural soft morning sunlight.*

---

#### 2. MacBook Air 13 inch M3
- **Slug**: `macbook-air-13-inch-m3-16gb-512gb`
- **Ảnh Chính (`macbook-air-13-inch-m3-main.jpg`)**:
  > *Commercial studio shot of the ultra-thin Apple MacBook Air 13-inch in Midnight blue color. The notebook is slightly open, hovering gracefully above a clean frosted glass base with soft colored ambient reflection. Ultra-thin profile emphasized, soft overhead studio softbox light, clean background, 8k sharp.*
- **Ảnh Phụ 1 — Cận Cảnh Bề Mặt Chống Bám Vân Tay (`macbook-air-13-inch-m3-detail.jpg`)**:
  > *Macro photograph of the MacBook Air lid in Midnight finish, focusing on the polished mirror Apple logo inset. Subtle anodization seal texture preventing fingerprints, elegant soft light sweep across the dark navy metallic surface, clean studio lighting, shallow depth of field.*
- **Ảnh Phụ 2 — Góc Nghiêng Độ Mỏng Kỷ Lục (`macbook-air-13-inch-m3-angle.jpg`)**:
  > *Eye-level razor-sharp horizontal side shot of the MacBook Air 13-inch closed, highlighting its uniform 11.3mm thinness. Set against a soft gray-to-white gradient background, sharp clean lines, elegant minimalist industrial design.*
- **Ảnh Phụ 3 — Phong Cách Sống Di Động (`macbook-air-13-inch-m3-lifestyle.jpg`)**:
  > *Top-down flatlay lifestyle shot of MacBook Air 13-inch Midnight on a modern cafe marble table, next to a leather notebook, slim fountain pen, and a glass of cold brew coffee. Natural cafe ambient light, warm and productive aesthetic.*

---

#### 3. iPad Pro 13 inch M4 Ultra Retina OLED
- **Slug**: `ipad-pro-13-inch-m4-ultra-retina-oled-256gb`
- **Ảnh Chính (`ipad-pro-13-inch-m4-main.jpg`)**:
  > *Commercial hero shot of the Apple iPad Pro 13-inch M4 in Silver finish. Front facing showing the Tandem OLED screen with deep vibrant black contrast and luminous colors, floating magnetically beside an Apple Pencil Pro. Studio light rim, crisp white background, premium tech catalog style.*
- **Ảnh Phụ 1 — Cận Cảnh Cụm Camera & Cảm Biến Lidar (`ipad-pro-13-inch-m4-detail.jpg`)**:
  > *Macro close-up photo of the rear camera module of iPad Pro M4. Single camera lens with sapphire crystal cover, LiDAR sensor, and microphone hole recessed in a brushed aluminum plate. Beautiful glass reflections, high precision tech rendering.*
- **Ảnh Phụ 2 — Cạnh Siêu Mỏng 5.1mm (`ipad-pro-13-inch-m4-angle.jpg`)**:
  > *Dramatic perspective view of the 5.1mm edge of iPad Pro 13-inch held vertically by a minimalist invisible stand. Quad-speaker micro-machined grilles and USB-C Thunderbolt port visible. Contrast lighting highlighting the impossibly slim profile.*
- **Ảnh Phụ 3 — Bàn Làm Việc Nghệ Sĩ Đồ Họa (`ipad-pro-13-inch-m4-lifestyle.jpg`)**:
  > *Creative workspace photography: iPad Pro 13-inch propped on an easel stand displaying a colorful digital illustration, an artist's hand using Apple Pencil Pro to shade details, warm studio ambiance with art books in blurred background.*

---

#### 4. ASUS ROG Zephyrus G16 OLED
- **Slug**: `asus-rog-zephyrus-g16-oled-gu605`
- **Ảnh Chính (`asus-rog-zephyrus-g16-main.jpg`)**:
  > *Professional gaming product studio shot of ASUS ROG Zephyrus G16 in Eclipse Gray CNC aluminum chassis. Screen open showing a 240Hz OLED cyberpunk visual. The Slash Lighting diagonal LED bar on the lid is glowing with an elegant white neon streak. Minimalist dark slate backdrop, sharp focus.*
- **Ảnh Phụ 1 — Cận Cảnh Dải Đèn Slash Lighting (`asus-rog-zephyrus-g16-detail.jpg`)**:
  > *Macro detail of the ROG Zephyrus G16 lid featuring the Slash Lighting diagonal LED slash. Clean CNC milled aluminum vents, custom micro-LED illuminated segments, sleek brushed metal texture, premium industrial aesthetic.*
- **Ảnh Phụ 2 — Cạnh Tản Nhiệt & Bàn Phím Đèn RGB (`asus-rog-zephyrus-g16-angle.jpg`)**:
  > *Low-angle three-quarters view of ROG Zephyrus G16 emphasizing the stealth vapor chamber rear exhaust and low-profile RGB illuminated keyboard. Subdued studio backlighting, high-end stealth gaming vibe.*
- **Ảnh Phụ 3 — Bàn Máy Tính Gaming / Render Cao Cấp (`asus-rog-zephyrus-g16-lifestyle.jpg`)**:
  > *High-end creator and gaming desk setup at night: ASUS Zephyrus G16 connected to an ultrawide monitor, ambient amber and teal backlighting, acoustic wall panels, clean wireless setup.*

---

#### 5. Dell XPS 16 9640 Core Ultra 7 4K OLED
- **Slug**: `dell-xps-16-9640-core-ultra-7-4k-oled`
- **Ảnh Chính (`dell-xps-16-9640-main.jpg`)**:
  > *Luxury studio product photography of Dell XPS 16 9640 in Platinum machined aluminum. Laptop open showing the infinity-edge 4K OLED display and seamless zero-lattice glass palm rest with invisible haptic trackpad. Neutral stone podium, warm directional studio lighting, ultra-sharp 8k.*
- **Ảnh Phụ 1 — Cận Cảnh Dải Phím Cảm Ứng & Mặt Kính (`dell-xps-16-9640-detail.jpg`)**:
  > *Macro shot of the futuristic capacitive touch function row and seamless glass palm rest of Dell XPS 16. Soft illuminated touch icons, smooth matte Gorilla Glass texture, machined aluminum borders, modern clean luxury.*
- **Ảnh Phụ 2 — Mặt Nghiêng Khung Nhôm CNC (`dell-xps-16-9640-angle.jpg`)**:
  > *Isometric side angle of Dell XPS 16 closed, showcasing diamond-cut polished side edges and dual Thunderbolt ports. Soft reflective floor, clean minimalist corporate design aesthetic.*
- **Ảnh Phụ 3 — Phòng Họp Ban Lãnh Đạo Hiện Đại (`dell-xps-16-9640-lifestyle.jpg`)**:
  > *Executive boardroom setting: Dell XPS 16 placed on an Italian walnut conference table, an espresso cup and leather portfolio nearby, blurred glass partitions of a modern skyscraper office in background.*

---

#### 6. Lenovo ThinkPad X1 Carbon Gen 12
- **Slug**: `lenovo-thinkpad-x1-carbon-gen-12`
- **Ảnh Chính (`lenovo-thinkpad-x1-carbon-gen-12-main.jpg`)**:
  > *Commercial studio product photography of the iconic Lenovo ThinkPad X1 Carbon Gen 12 in Deep Black carbon fiber weave. Open at 90 degrees showcasing the 2.8K OLED panel and signature red TrackPoint dot in the center of keyboard. Pure dark studio background with subtle red accent lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Nút TrackPoint Đỏ & Bản Lề Carbon (`lenovo-thinkpad-x1-carbon-gen-12-detail.jpg`)**:
  > *Macro close-up shot of the iconic red rubber TrackPoint nub nestled between G, H, B keys on the ThinkPad X1 Carbon. Velvet-touch matte black keyboard finish, textured carbon fiber weave visible on the wrist rest.*
- **Ảnh Phụ 2 — Góc Nghiêng Mở Phẳng 180 Độ (`lenovo-thinkpad-x1-carbon-gen-12-angle.jpg`)**:
  > *Perspective view of ThinkPad X1 Carbon opened completely 180 degrees flat on a designer concrete table. Demonstrating ultra-rigid dual hinge mechanism and ultra-thin profile, clean studio lighting.*
- **Ảnh Phụ 3 — Góc Làm Việc Lập Trình Viên (`lenovo-thinkpad-x1-carbon-gen-12-lifestyle.jpg`)**:
  > *Modern software engineer desk setup: ThinkPad X1 Carbon running code editor in dark mode, mechanical numpad, noise-cancelling headphones resting nearby, warm ambient shelf lighting in a Scandinavian study.*

---

### DANH MỤC 2: ÂM THANH ĐỈNH CAO (Category Slug: `am-thanh`)

#### 7. Sony WH-1000XM5 Hi-Res Noise Cancelling
- **Slug**: `tai-nghe-sony-wh-1000xm5`
- **Ảnh Chính (`tai-nghe-sony-wh-1000xm5-main.jpg`)**:
  > *Commercial studio photography of Sony WH-1000XM5 headphones in Silver finish with soft off-white earpads. Headphones floating upright in mid-air over a curved architectural gypsum block. Soft diffused lighting, clean shadows, high-end audio luxury catalog look.*
- **Ảnh Phụ 1 — Cận Cảnh Đệm Tai Giả Da & Khớp Trượt Vô Cấp (`tai-nghe-sony-wh-1000xm5-detail.jpg`)**:
  > *Extreme macro detail of the soft fit synthetic leather earpad and stepless friction slider of Sony WH-1000XM5. Smooth matte texture, micro-mesh speaker grill inside earcup, gold Sony logo engraving, warm softbox lighting.*
- **Ảnh Phụ 2 — Góc Gập Phẳng & Cổng Type-C (`tai-nghe-sony-wh-1000xm5-angle.jpg`)**:
  > *Top-down 45-degree angle of Sony WH-1000XM5 swivel-folded flat on a light sandstone surface. Clear view of microphone ports for noise cancellation and USB-C port, clean aesthetic.*
- **Ảnh Phụ 3 — Thư Giãn Trong Khoang Máy Bay Hạng Nhất (`tai-nghe-sony-wh-1000xm5-lifestyle.jpg`)**:
  > *Lifestyle photography in an airplane first-class cabin: Sony WH-1000XM5 resting on a luxury leather seat armrest next to an open boarding pass and glass of champagne, cozy warm cabin window light.*

---

#### 8. Loa Marshall Stanmore III
- **Slug**: `loa-marshall-stanmore-iii`
- **Ảnh Chính (`loa-marshall-stanmore-iii-main.jpg`)**:
  > *Product hero studio shot of Marshall Stanmore III Bluetooth speaker in Brown textured vinyl with iconic brass script logo on vintage fret fabric. Centered on a retro teak wood credenza, warm analog spotlighting, rich shadows, 8k commercial quality.*
- **Ảnh Phụ 1 — Cận Cảnh Bảng Điều Khiển Núm Vặn Đồng Thau (`loa-marshall-stanmore-iii-detail.jpg`)**:
  > *Macro shot of the top brass control plate of Marshall Stanmore III: tactile knurled brass knobs for Volume, Bass, Treble with red LED indicator lights, brass power toggle switch, laser etched 'EST. 1962' inscription, vintage warm glow.*
- **Ảnh Phụ 2 — Góc Nghiêng Lưới Vải Loa Cổ Điển (`loa-marshall-stanmore-iii-angle.jpg`)**:
  > *Three-quarter perspective view of Marshall Stanmore III showing the side leatherette wrap and golden piping around the front grille. Rich warm textures, moody ambient studio light.*
- **Ảnh Phụ 3 — Phòng Khách Phong Cách Mid-Century (`loa-marshall-stanmore-iii-lifestyle.jpg`)**:
  > *Lifestyle interior photography: Marshall Stanmore III playing music on a mid-century modern credenza next to stacked vinyl records, an acoustic guitar, and a monstera plant in a sunlit living room.*

---

#### 9. Apple AirPods Pro 2 USB-C
- **Slug**: `apple-airpods-pro-2-usb-c`
- **Ảnh Chính (`apple-airpods-pro-2-usb-c-main.jpg`)**:
  > *Commercial studio shot of Apple AirPods Pro 2 with MagSafe Case (USB-C). Case open with earbuds hovering just above it, glossy pure white finish with chrome accents and black acoustic vents. Crisp pure white studio background with soft natural drop shadow.*
- **Ảnh Phụ 1 — Cận Cảnh Đầu Đệm Silicone & Lưới Micro (`apple-airpods-pro-2-usb-c-detail.jpg`)**:
  > *Extreme macro detail of one AirPods Pro 2 earbud focusing on the translucent white silicone ear tip, capacitive touch groove on the stem, and the inward-facing microphone mesh. Hyper-detailed studio rendering.*
- **Ảnh Phụ 2 — Mặt Đáy Hộp Sạc Cổng USB-C & Loa Cảnh Báo (`apple-airpods-pro-2-usb-c-angle.jpg`)**:
  > *Close-up bottom angle of the AirPods Pro 2 MagSafe charging case, highlighting the oval USB-C port, lanyard loop metal insert, and miniature speaker holes for Find My sound alerts.*
- **Ảnh Phụ 3 — Phụ Kiện Tập Luyện & Thể Thao (`apple-airpods-pro-2-usb-c-lifestyle.jpg`)**:
  > *Active lifestyle flatlay: AirPods Pro 2 case resting on an athlete's gym towel beside a metallic water bottle and running shoes, soft natural morning gym lighting.*

---

#### 10. Bose QuietComfort Ultra Headphones
- **Slug**: `tai-nghe-bose-quietcomfort-ultra`
- **Ảnh Chính (`tai-nghe-bose-quietcomfort-ultra-main.jpg`)**:
  > *Commercial studio photography of Bose QuietComfort Ultra Headphones in White Smoke finish with polished aluminum arms. Headphones resting on an architectural white marble pedestal. Subtle blue-tinted rim light, ultra-luxurious audio design feel.*
- **Ảnh Phụ 1 — Cận Cảnh Càng Kim Loại Phay Xước (`tai-nghe-bose-quietcomfort-ultra-detail.jpg`)**:
  > *Macro shot of the pivoting cast aluminum hinge of Bose QuietComfort Ultra. Precision brushed metal texture, embossed metallic Bose emblem, ultra-soft protein leather headband padding.*
- **Ảnh Phụ 2 — Góc Nhìn Vòm Âm Học & Thanh Âm Lượng Cảm Ứng (`tai-nghe-bose-quietcomfort-ultra-angle.jpg`)**:
  > *Side profile view of the Bose QC Ultra ear cup showing the capacitive volume touch strip along the rim and acoustic vents. Clean directional light emphasizing the curved contour.*
- **Ảnh Phụ 3 — Quán Cà Phê Phong Cách Bắc Âu (`tai-nghe-bose-quietcomfort-ultra-lifestyle.jpg`)**:
  > *Lifestyle photography: Bose QuietComfort Ultra headphones around a person's neck inside a quiet minimalist Nordic cafe with glass walls, soft diffuse rainy day window light.*

---

#### 11. JBL Boombox 3 Wi-Fi Dolby Atmos
- **Slug**: `loa-jbl-boombox-3-wifi`
- **Ảnh Chính (`loa-jbl-boombox-3-wifi-main.jpg`)**:
  > *Studio product shot of JBL Boombox 3 Wi-Fi portable speaker in Black rugged fabric with heavy-duty metal handle and orange silicone grip. Frontal angle showing subwoofer passive radiators on sides, placed on a dark stone slab, dramatic studio rim lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Màng Loa Thụ Động Bọc Kim Loại (`loa-jbl-boombox-3-wifi-detail.jpg`)**:
  > *Macro detail of the side passive radiator disc on JBL Boombox 3 with metallic embossed JBL exclamation mark logo and waterproof rubber surround, droplets of fresh water mist on the surface.*
- **Ảnh Phụ 2 — Góc Nhìn Tay Cầm Kim Loại Khối (`loa-jbl-boombox-3-wifi-angle.jpg`)**:
  > *Low-angle dramatic perspective view focusing on the sturdy ergonomic aluminum carry handle with orange silicone lining. Industrial rugged outdoor speaker aesthetic.*
- **Ảnh Phụ 3 — Tiệc Bể Bơi Biệt Thự Hoàng Hôn (`loa-jbl-boombox-3-wifi-lifestyle.jpg`)**:
  > *Outdoor lifestyle shot: JBL Boombox 3 playing music on the edge of a luxury infinity pool during golden hour sunset, tropical palm reflections in turquoise pool water.*

---

#### 12. Apple AirPods Max USB-C
- **Slug**: `apple-airpods-max-usb-c`
- **Ảnh Chính (`apple-airpods-max-usb-c-main.jpg`)**:
  > *Hero commercial product photography of Apple AirPods Max (USB-C edition) in Midnight deep navy color. Perfectly balanced upright on an organic off-white matte display ring. Ambient gradient studio backdrop, high-end Apple hardware aesthetic.*
- **Ảnh Phụ 1 — Cận Cảnh Lưới Thoáng Khí Knit-Mesh & Núm Digital Crown (`apple-airpods-max-usb-c-detail.jpg`)**:
  > *Macro close-up shot of the top stainless steel frame covered with breathable knit mesh canopy, alongside the anodized aluminum ear cup with stainless steel Digital Crown and Noise Control button.*
- **Ảnh Phụ 2 — Góc Nghiêng Ly Hợp Khung Thép Không Gỉ (`apple-airpods-max-usb-c-angle.jpg`)**:
  > *Isometric 45-degree angle showing the telescoping arms and revolutionary magnetic acoustically engineered memory foam ear cushions, soft studio lighting reflecting along curved anodized aluminum.*
- **Ảnh Phụ 3 — Phòng Thu Âm Sáng Tạo (`apple-airpods-max-usb-c-lifestyle.jpg`)**:
  > *Creative studio setting: AirPods Max resting on a wooden sound engineer mixing console beside audio synthesizers and warm vacuum tube amplifiers in a moody soundproofed studio.*

---

### DANH MỤC 3: NHÀ THÔNG MINH (Category Slug: `nha-thong-minh`)

#### 13. Hub Matter Aqara M3
- **Slug**: `hub-matter-aqara-m3`
- **Ảnh Chính (`hub-matter-aqara-m3-main.jpg`)**:
  > *Commercial studio product photography of Aqara Hub M3 in matte black square form factor with rounded corners. The central status LED ring is gently glowing cyan. Placed on a contemporary dark architectural pedestal, soft studio lighting, sharp focus.*
- **Ảnh Phụ 1 — Cận Cảnh Logo Matter & Vỏ Chống Cháy (`hub-matter-aqara-m3-detail.jpg`)**:
  > *Macro shot of the Aqara Hub M3 top surface featuring the engraved matte Aqara logo and subtle Matter compatibility badge. Micro-textured matte poly-carbonate finish, soft diffused light.*
- **Ảnh Phụ 2 — Góc Nghiêng Cổng Mạng PoE & USB-C (`hub-matter-aqara-m3-angle.jpg`)**:
  > *Rear three-quarter view showing the recessed RJ45 Ethernet PoE port, USB-C power input, and wall mount bracket slots, clean industrial product photo style.*
- **Ảnh Phụ 3 — Đặt Trên Kệ TV Phòng Khách Hiện Đại (`hub-matter-aqara-m3-lifestyle.jpg`)**:
  > *Interior lifestyle photo: Aqara Hub M3 discreetly placed on a floating slatted oak TV console, blending seamlessly into a warm contemporary smart living room with ambient cove lighting.*

---

#### 14. Khóa Cửa Thông Minh Aqara U200 Kit
- **Slug**: `khoa-cua-thong-minh-aqara-u200`
- **Ảnh Chính (`khoa-cua-thong-minh-aqara-u200-main.jpg`)**:
  > *Commercial hero product shot of the Aqara Smart Lock U200 motorized retrofit lock and wireless keypad with fingerprint scanner in Space Gray finish. Set side-by-side on an elegant vertical display stand with soft rim lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Bàn Phím Số Cảm Ứng & Vân Tay (`khoa-cua-thong-minh-aqara-u200-detail.jpg`)**:
  > *Extreme macro detail of the wireless keypad: touch illuminated numbers glowing crisp white, circular biometric fingerprint reader with green verification ring, Apple Home Key NFC sensor zone.*
- **Ảnh Phụ 2 — Góc Nghiêng Núm Vặn Cơ Khí Khẩn Cấp (`khoa-cua-thong-minh-aqara-u200-angle.jpg`)**:
  > *Perspective angle of the indoor motorized turn-lock cylinder unit, highlighting the tactile knurled aluminum knob and smooth rotating mechanism, studio gradient backdrop.*
- **Ảnh Phụ 3 — Lắp Đặt Trên Cửa Gỗ Biệt Thự (`khoa-cua-thong-minh-aqara-u200-lifestyle.jpg`)**:
  > *Lifestyle photography: Aqara U200 mounted on a dark solid walnut apartment door, a person tapping their Apple Watch against the keypad to unlock with Apple Home Key, warm entrance light.*

---

#### 15. Bộ Khởi Động Đèn Philips Hue Starter Kit E27
- **Slug**: `den-philips-hue-starter-kit-e27`
- **Ảnh Chính (`den-philips-hue-starter-kit-e27-main.jpg`)**:
  > *Studio product arrangement: three Philips Hue White & Color Ambiance E27 bulbs arranged artfully around the square Philips Hue Bridge. The bulbs are gently glowing in a smooth gradient of lavender, warm amber, and ocean blue. Clean white reflective tabletop.*
- **Ảnh Phụ 1 — Cận Cảnh Đui Đèn Kim Loại & Thủy Tinh Mờ (`den-philips-hue-starter-kit-e27-detail.jpg`)**:
  > *Macro photograph of a single Philips Hue E27 bulb: precision brass screw thread, white thermal ceramic base with printed Philips Hue branding, and smooth frosted glass globe glowing with warm sunset orange hue.*
- **Ảnh Phụ 2 — Hub Trung Tâm Hue Bridge Với 3 Đèn LED Xanh (`den-philips-hue-starter-kit-e27-angle.jpg`)**:
  > *Close-up perspective shot of the Philips Hue Bridge unit: central circular pairing button illuminated by a glowing blue ring and three status LEDs showing power, network, and cloud connectivity.*
- **Ảnh Phụ 3 — Không Gian Phòng Ngủ Thư Giãn Đổi Màu (`den-philips-hue-starter-kit-e27-lifestyle.jpg`)**:
  > *Interior lifestyle: bedroom ambient lighting with Philips Hue bulb in a bedside designer ceramic lamp, casting a soothing warm 2200K amber glow across linen bedding and cozy books.*

---

#### 16. Màn Hình Thông Minh Google Nest Hub Gen 2
- **Slug**: `google-nest-hub-gen-2`
- **Ảnh Chính (`google-nest-hub-gen-2-main.jpg`)**:
  > *Commercial studio photo of Google Nest Hub Gen 2 in Chalk white finish with fabric speaker base. Frontal 7-inch display showing Google Home smart dashboard with weather widget and light controls. Standing on a light birch wood surface, bright airy studio lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Vải Bọc Tái Chế & Cảm Biến Soli (`google-nest-hub-gen-2-detail.jpg`)**:
  > *Macro detail of the Google Nest Hub front bezel: subtle Soli radar sensor aperture, ambient light EQ sensor, and the acoustic textured recycled fabric base, soft pastel lighting.*
- **Ảnh Phụ 2 — Góc Nghiêng Công Tắc Ngắt Micro Vật Lý (`google-nest-hub-gen-2-angle.jpg`)**:
  > *Side and rear 45-degree angle showing the streamlined tilted display angle, rear physical microphone mute toggle switch, and clean circular DC power plug.*
- **Ảnh Phụ 3 — Đặt Tại Bàn Đầu Giường Theo Dõi Giấc Ngủ (`google-nest-hub-gen-2-lifestyle.jpg`)**:
  > *Lifestyle bedroom setup: Google Nest Hub Gen 2 on a minimalist nightstand displaying Sleep Sensing summary, a carafe of water, and a succulent plant in morning bedroom sunlight.*

---

#### 17. Loa Thông Minh Apple HomePod mini
- **Slug**: `apple-homepod-mini`
- **Ảnh Chính (`apple-homepod-mini-main.jpg`)**:
  > *Hero studio product shot of Apple HomePod mini in White seamless acoustic fabric mesh. The top backlit touch surface is glowing with colorful animated Siri waveform light. Set on an organic stone podium, soft studio backlight.*
- **Ảnh Phụ 1 — Cận Cảnh Bề Mặt Cảm Ứng Đổi Màu Siri (`apple-homepod-mini-detail.jpg`)**:
  > *Top-down macro shot of HomePod mini's frosted glass touch interface with illuminated plus and minus volume symbols and vibrant multicolored swirling Siri glow, macro photography.*
- **Ảnh Phụ 2 — Lưới Vải Âm Học Không Mối Nối (`apple-homepod-mini-angle.jpg`)**:
  > *Close-up side perspective of HomePod mini highlighting the 3D acoustic knit fabric weave that lets sound pass freely, integrated silicone non-slip base, clean studio light sweep.*
- **Ảnh Phụ 3 — Bàn Làm Việc Tinh Tế Cặp Đôi Stereo (`apple-homepod-mini-lifestyle.jpg`)**:
  > *Lifestyle desktop setting: Two Apple HomePod mini speakers configured as a stereo pair flanking an Apple Studio Display on a walnut desk with soft warm accent light.*

---

#### 18. Camera An Ninh Aqara Hub G3 AI 2K
- **Slug**: `camera-aqara-hub-g3-ai-2k`
- **Ảnh Chính (`camera-aqara-hub-g3-ai-2k-main.jpg`)**:
  > *Studio product photograph of Aqara Camera Hub G3 in matte white finish with cute silicone ear cover. The large 2K glass camera eye is centered, with LED status ring glowing soft blue. Clean light gray studio backdrop.*
- **Ảnh Phụ 1 — Cận Cảnh Ống Kính 2K & Khe Thẻ Nhớ Chế Độ Riêng Tư (`camera-aqara-hub-g3-ai-2k-detail.jpg`)**:
  > *Macro detail of the rotating camera eyeball when rolled into sleep mode, showing the cute sleepy face graphic painted on the physical privacy shutter and MicroSD card slot.*
- **Ảnh Phụ 2 — Chân Đế Xoay 360 Độ & Loa Đàm Thoại (`camera-aqara-hub-g3-ai-2k-angle.jpg`)**:
  > *Perspective view of Aqara G3 showing the motorized motorized 360-degree pan base, rear speaker grille for two-way audio, and USB-C port.*
- **Ảnh Phụ 3 — Quan Sát Trẻ Em & Thú Cưng Trong Phòng Khách (`camera-aqara-hub-g3-ai-2k-lifestyle.jpg`)**:
  > *Interior lifestyle: Aqara Camera Hub G3 on a bookshelf overlooking a bright sunlit modern Scandinavian living room where a golden retriever is resting peacefully on a wool rug.*

---

### DANH MỤC 4: PHỤ KIỆN CAO CẤP (Category Slug: `phu-kien-cong-nghe`)

#### 19. Củ Sạc Nhanh Anker Prime 100W GaN
- **Slug**: `cu-sac-anker-prime-100w-gan`
- **Ảnh Chính (`cu-sac-anker-prime-100w-gan-main.jpg`)**:
  > *Commercial studio product photography of Anker Prime 100W GaN wall charger in Gunmetal black metallic finish. Charging prongs folded neatly, 3 front output ports (2 USB-C + 1 USB-A) facing forward. Suspended over a dark polished obsidian block, dramatic rim light.*
- **Ảnh Phụ 1 — Cận Cảnh Cổng Cắm Mạ Vàng IQ3 & Anker Logo (`cu-sac-anker-prime-100w-gan-detail.jpg`)**:
  > *Macro close-up of the front port plate: laser-etched PowerIQ 3.0 icons, precision molded blue USB-A tongue, and metallic Anker logo with subtle hairline brushed finish.*
- **Ảnh Phụ 2 — Góc Nghiêng Độ Nhỏ Gọn Cạnh Quả Táo (`cu-sac-anker-prime-100w-gan-angle.jpg`)**:
  > *Three-quarter side angle showing compact GaN architecture form factor with subtle ridges along the side for grip, foldable plug mechanism, soft studio shadow.*
- **Ảnh Phụ 3 — Cắm Trên Ổ Cắm Tường Phòng Khách Sạn (`cu-sac-anker-prime-100w-gan-lifestyle.jpg`)**:
  > *Travel lifestyle photography: Anker Prime 100W plugged into a sleek modern hotel room wall outlet, simultaneously fast-charging a laptop and phone with braided cables, evening cozy mood.*

---

#### 20. Trạm Sạc Không Dây Belkin BoostCharge Pro 3-in-1
- **Slug**: `tram-sac-belkin-boostcharge-pro-3-in-1`
- **Ảnh Chính (`tram-sac-belkin-boostcharge-pro-3-in-1-main.jpg`)**:
  > *Hero product shot of Belkin BoostCharge Pro 3-in-1 wireless charging tree stand in Matte White with polished chrome stainless steel T-arm. White MagSafe disc, Apple Watch fast charging puck, and base pad for AirPods. Clean white studio background.*
- **Ảnh Phụ 1 — Cận Cảnh Đĩa Sạc MagSafe 15W Hít Nam Châm (`tram-sac-belkin-boostcharge-pro-3-in-1-detail.jpg`)**:
  > *Macro detail of the angled MagSafe charging puck with soft-touch silicone padding and polished chrome ring bevel, precision Apple Made for MagSafe build quality.*
- **Ảnh Phụ 2 — Góc Nhìn Cấu Trúc Khung Thép Không Gỉ (`tram-sac-belkin-boostcharge-pro-3-in-1-angle.jpg`)**:
  > *Low-angle perspective highlighting the sculptural stainless steel arm branching into dual floating charging mounts, weighted circular base with subtle status LED.*
- **Ảnh Phụ 3 — Đặt Trên Bàn Đầu Giường Sang Trọng (`tram-sac-belkin-boostcharge-pro-3-in-1-lifestyle.jpg`)**:
  > *Luxury master bedroom nightstand lifestyle: Belkin 3-in-1 stand wirelessly charging an iPhone in StandBy clock mode, an Apple Watch, and AirPods simultaneously, warm night lamp glow.*

---

#### 21. Cáp Sạc Bọc Dù Ugreen 240W Type-C
- **Slug**: `cap-ugreen-240w-type-c-to-c`
- **Ảnh Chính (`cap-ugreen-240w-type-c-to-c-main.jpg`)**:
  > *Commercial studio product photography of Ugreen 240W USB-C to USB-C cable in Space Gray. The cable is artfully coiled in an infinity loop with both zinc alloy connector heads displayed in the center. Floating over a light marble slab, crisp lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Đầu Cắm Hợp Kim Kẽm & Đèn Khắc Laser 240W (`cap-ugreen-240w-type-c-to-c-detail.jpg`)**:
  > *Macro close-up shot of the USB-C connector housing made of space gray zinc alloy with laser-etched '240W' badge, reinforced SR strain relief joint, and gold-plated pins.*
- **Ảnh Phụ 2 — Chi Tiết Sợi Dù Bện Mật Độ Cao Siêu Chống Đứt (`cap-ugreen-240w-type-c-to-c-angle.jpg`)**:
  > *Extreme macro texture photograph of the braided high-density nylon cable jacket, showing intricate crisscross weaving of reflective silver and charcoal fibers, tack sharp.*
- **Ảnh Phụ 3 — Kết Nối Sạc Laptop Ngoài Quán Cà Phê (`cap-ugreen-240w-type-c-to-c-lifestyle.jpg`)**:
  > *Everyday carry tech lifestyle: Ugreen braided cable connecting a compact power bank to a thin laptop on an outdoor wooden patio cafe table in soft afternoon daylight.*

---

#### 22. Chuột Không Dây Logitech MX Master 3S
- **Slug**: `chuot-logitech-mx-master-3s`
- **Ảnh Chính (`chuot-logitech-mx-master-3s-main.jpg`)**:
  > *Hero commercial studio shot of Logitech MX Master 3S wireless mouse in Graphite dark finish. Ergonomic thumb rest facing forward, machined steel MagSpeed scroll wheel catching light reflections. Placed on an architectural dark felt desk mat, studio lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Con Lăn Kim Loại MagSpeed Điện Từ (`chuot-logitech-mx-master-3s-detail.jpg`)**:
  > *Extreme macro detail of the stainless steel MagSpeed wheel with knurled side grooves, gesture thumb button, and horizontal thumb scroll wheel. Precision Swiss engineering aesthetic.*
- **Ảnh Phụ 2 — Góc Nghiêng Công Thái Học Vừa Vặn Lòng Bàn Tay (`chuot-logitech-mx-master-3s-angle.jpg`)**:
  > *Rear side perspective view demonstrating the ergonomic tilted palm silhouette of MX Master 3S designed to relieve wrist pressure. Matte rubberized coating, soft directional light.*
- **Ảnh Phụ 3 — Bàn Làm Việc Đồ Họa Chuyên Nghiệp (`chuot-logitech-mx-master-3s-lifestyle.jpg`)**:
  > *Creative workspace lifestyle: Logitech MX Master 3S beside a split ergonomic keyboard on a wool felt desk mat, Lightroom editing photo on monitor in background, serene studio mood.*

---

#### 23. Bàn Phím Cơ Không Dây Keychron Q1 Pro
- **Slug**: `ban-phim-keychron-q1-pro`
- **Ảnh Chính (`ban-phim-keychron-q1-pro-main.jpg`)**:
  > *Commercial studio product photography of Keychron Q1 Pro wireless mechanical keyboard in Carbon Black anodized aluminum case with retro gray and orange PBT keycaps. Top-down 60-degree angle, rotary encoder brass knob at top right. Crisp softbox lighting, clean shadow.*
- **Ảnh Phụ 1 — Cận Cảnh Núm Xoay Nhôm & Keycap PBT Double-shot (`ban-phim-keychron-q1-pro-detail.jpg`)**:
  > *Macro shot of the programmable rotary aluminum encoder knob and adjacent Esc key. Textured matte PBT keycap surface, south-facing RGB glow under keys, chamfered aluminum case edge.*
- **Ảnh Phụ 2 — Mặt Nghiêng Khung Nhôm CNC Khối Lượng Nặng (`ban-phim-keychron-q1-pro-angle.jpg`)**:
  > *Low-angle side view highlighting the steep ergonomic typing slope, solid CNC machined 6063 aluminum bottom case with brass weight bar, and Mac/Windows switch next to USB-C port.*
- **Ảnh Phụ 3 — Góc Bàn Làm Việc Lập Trình Viên Đèn Ấm (`ban-phim-keychron-q1-pro-lifestyle.jpg`)**:
  > *Cozy night workspace: Keychron Q1 Pro with customized RGB lighting on a solid walnut desk, warm monitor lightbar illuminating the keyboard, hot cup of tea nearby.*

---

#### 24. Sạc Dự Phòng Trong Suốt Shargeek Storm 2
- **Slug**: `pin-du-phong-shargeek-storm-2-100w`
- **Ảnh Chính (`pin-du-phong-shargeek-storm-2-100w-main.jpg`)**:
  > *Futuristic studio photography of Shargeek Storm 2 100W 25600mAh power bank. The crystal-clear transparent fireproof enclosure showcases internal yellow circuit board, Samsung battery cells, and color IPS smart screen. Resting on a dark metallic mirrored floor.*
- **Ảnh Phụ 1 — Cận Cảnh Màn Hình Màu IPS Hiển Thị Công Suất (`pin-du-phong-shargeek-storm-2-100w-detail.jpg`)**:
  > *Extreme macro shot of the integrated IPS full-color display showing live battery percentage, real-time voltage, current wattage curve, and PCB temperature, cyberpunk tech aesthetics.*
- **Ảnh Phụ 2 — Cụm Cổng Kết Nối Đa Năng Cùng Cổng DC Điều Chỉnh (`pin-du-phong-shargeek-storm-2-100w-angle.jpg`)**:
  > *Three-quarter view of the front port face: dual USB-C ports, USB-A port, and adjustable DC barrel port, flanked by tactile yellow selection button, crisp lighting.*
- **Ảnh Phụ 3 — Hành Trình Du Lịch Trên Khoang Tàu Cao Tốc (`pin-du-phong-shargeek-storm-2-100w-lifestyle.jpg`)**:
  > *Cyberpunk travel lifestyle: Shargeek Storm 2 on a train window table charging an iPhone and handheld gaming console, motion blur of scenery outside the window.*

---

### DANH MỤC 5: THIẾT BỊ ĐEO THÔNG MINH (Category Slug: `thiet-bi-deo-thong-minh`)

#### 25. Apple Watch Ultra 2 Titanium
- **Slug**: `apple-watch-ultra-2-titanium`
- **Ảnh Chính (`apple-watch-ultra-2-titanium-main.jpg`)**:
  > *Commercial hero studio shot of Apple Watch Ultra 2 with 49mm aerospace-grade natural titanium case and Orange Ocean Band. Display active showing the Wayfinder face with live compass. Upright on a weathered volcanic stone pedestal, high-contrast adventure lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Núm Digital Crown & Nút Action Cam (`apple-watch-ultra-2-titanium-detail.jpg`)**:
  > *Macro detail of the elevated titanium Digital Crown housing, knurled dial with orange accent ring, dual microphones, and the international orange Action Button on the opposing edge.*
- **Ảnh Phụ 2 — Mặt Kính Phẳng Sapphire & Còi Báo Động Kép (`apple-watch-ultra-2-titanium-angle.jpg`)**:
  > *Side profile 45-degree angle showing the flat sapphire crystal screen protected by raised titanium lip, dual siren speaker holes, and water depth gauge sensor.*
- **Ảnh Phụ 3 — Chinh Phục Đỉnh Núi Hoàng Hôn (`apple-watch-ultra-2-titanium-lifestyle.jpg`)**:
  > *Outdoor adventure photography: Apple Watch Ultra 2 worn on a hiker's wrist gripping a trekking pole at a mountain summit during golden sunset, rugged alpine background.*

---

#### 26. Apple Watch Series 10 Nhôm GPS
- **Slug**: `apple-watch-series-10-nhom-gps`
- **Ảnh Chính (`apple-watch-series-10-nhom-gps-main.jpg`)**:
  > *Commercial studio shot of Apple Watch Series 10 in Jet Black high-gloss polished aluminum with matching black Sport Band. Ultra-slim profile emphasized, wide-angle OLED display glowing bright. Set on a reflective glossy white podium.*
- **Ảnh Phụ 1 — Cận Cảnh Viền Màn Hình Siêu Mỏng & Mép Kính Cong (`apple-watch-series-10-nhom-gps-detail.jpg`)**:
  > *Macro photograph of the front glass flowing seamlessly into the glossy jet black aluminum frame with almost imperceptible bezels, vibrant watch face typography.*
- **Ảnh Phụ 2 — Thân Máy Siêu Mỏng Kỷ Lục 9.7mm (`apple-watch-series-10-nhom-gps-angle.jpg`)**:
  > *Razor-sharp horizontal side shot showing the remarkably thin 9.7mm case of Series 10, redesigned acoustic speaker slits, and flush ceramic sensor back.*
- **Ảnh Phụ 3 — Trang Phục Công Sở Sang Trọng (`apple-watch-series-10-nhom-gps-lifestyle.jpg`)**:
  > *Urban lifestyle: Apple Watch Series 10 Jet Black peeking out from the cuff of a tailored charcoal wool suit jacket, held against an espresso cup in a sunlit atrium.*

---

#### 27. Garmin Fenix 8 AMOLED 47mm
- **Slug**: `garmin-fenix-8-amoled-47mm`
- **Ảnh Chính (`garmin-fenix-8-amoled-47mm-main.jpg`)**:
  > *Rugged studio product shot of Garmin Fenix 8 47mm with Titanium bezel and bright AMOLED display showing training readiness metrics. Mounted on a slab of dark rough slate, dramatic directional edge lighting, military grade aesthetics.*
- **Ảnh Phụ 1 — Cận Cảnh Viền Titanium Vát Cạnh & Ốc Vít Lục Giác (`garmin-fenix-8-amoled-47mm-detail.jpg`)**:
  > *Macro detail of the DLC-coated titanium bezel of Garmin Fenix 8 with exposed Torx screws, knurled metal buttons with sensor leak-proof seals, and red accent ring.*
- **Ảnh Phụ 2 — Đèn Pin LED Tích Hợp Ở Cạnh Đỉnh Đồng Hồ (`garmin-fenix-8-amoled-47mm-angle.jpg`)**:
  > *Close-up perspective focusing on the top edge of the watch case showing the built-in dual LED flashlight lens emitting a bright white beam, sapphire glass reflections.*
- **Ảnh Phụ 3 — Buổi Chạy Bộ Địa Hình Đường Rừng (`garmin-fenix-8-amoled-47mm-lifestyle.jpg`)**:
  > *Trail running lifestyle photography: Garmin Fenix 8 on an athlete's sweat-beaded wrist navigating through a misty pine forest trail, trail shoes kicking up pine needles.*

---

#### 28. Garmin Epix Pro Gen 2 Sapphire 51mm
- **Slug**: `garmin-epix-pro-gen-2-sapphire`
- **Ảnh Chính (`garmin-epix-pro-gen-2-sapphire-main.jpg`)**:
  > *Commercial hero shot of Garmin Epix Pro (Gen 2) Sapphire 51mm in Black DLC Titanium. The ultra-sharp AMOLED screen displays an intricate full-color topo map with topographic contours. Clean minimalist dark background.*
- **Ảnh Phụ 1 — Cận Cảnh Cụm Cảm Biến Nhịp Tim Elevate Gen 5 (`garmin-epix-pro-gen-2-sapphire-detail.jpg`)**:
  > *Macro photography of the rear case back: new Elevate Gen 5 biometric sensor array with 6 green and infrared LEDs and 4 optical receptors surrounded by brushed titanium ring.*
- **Ảnh Phụ 2 — Mặt Kính Sapphire Chống Trầy Góc Nghiêng (`garmin-epix-pro-gen-2-sapphire-angle.jpg`)**:
  > *45-degree isometric view highlighting the high-grade scratch-resistant sapphire crystal dome lens and QuickFit 26mm silicone strap connection mechanism.*
- **Ảnh Phụ 3 — Đạp Xe Leo Đèo Bờ Biển (`garmin-epix-pro-gen-2-sapphire-lifestyle.jpg`)**:
  > *Cyclist sports lifestyle: Garmin Epix Pro on cyclist's wrist gripping aero drop handlebars on an asphalt coastal highway with ocean cliffs in blurred background.*

---

#### 29. Samsung Galaxy Watch Ultra 47mm LTE
- **Slug**: `samsung-galaxy-watch-ultra-47mm-lte`
- **Ảnh Chính (`samsung-galaxy-watch-ultra-47mm-lte-main.jpg`)**:
  > *Studio product photography of Samsung Galaxy Watch Ultra in Titanium Gray with orange Marine Band. Unique cushion case design showcased, vibrant watch face showing Galaxy AI health score. Resting on an architectural concrete column, crisp lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Nút Quick Button Màu Cam & Vỏ Cushion Titanium (`samsung-galaxy-watch-ultra-47mm-lte-detail.jpg`)**:
  > *Macro detail of the distinctive orange physical Quick Button on Galaxy Watch Ultra, surrounding Grade 4 titanium sandblasted texture, micro-speaker vents for emergency siren.*
- **Ảnh Phụ 2 — Khung Đệm Cushion Đa Giác & Móc Dây Liền Mạch (`samsung-galaxy-watch-ultra-47mm-lte-angle.jpg`)**:
  > *Perspective low-angle shot demonstrating the squircle cushion housing blending a round screen with a robust squarish base, dynamic lug-less band connector.*
- **Ảnh Phụ 3 — Lặn Biển San Hô Dưới Nước (`samsung-galaxy-watch-ultra-47mm-lte-lifestyle.jpg`)**:
  > *Underwater sports photography: Samsung Galaxy Watch Ultra strapped to a diver's wrist submerged in crystal-clear turquoise ocean water next to vibrant coral reef, sunbeams piercing the water.*

---

#### 30. Xiaomi Smart Band 9 Pro
- **Slug**: `xiaomi-smart-band-9-pro`
- **Ảnh Chính (`xiaomi-smart-band-9-pro-main.jpg`)**:
  > *Commercial studio shot of Xiaomi Smart Band 9 Pro in Moonlight Silver aluminum frame with white fluoro-rubber strap. 1.74-inch rectangular AMOLED display glowing with modern fitness stats. Clean pastel gradient background.*
- **Ảnh Phụ 1 — Cận Cảnh Khung Kim Loại Phun Cát Mờ CNC (`xiaomi-smart-band-9-pro-detail.jpg`)**:
  > *Macro detail of the sandblasted high-gloss NCVM aluminum metal frame, smooth 2.5D curved glass screen edge, and quick-release strap button.*
- **Ảnh Phụ 2 — Góc Nghiêng Độ Nhẹ & Cảm Biến Đo SpO2 (`xiaomi-smart-band-9-pro-angle.jpg`)**:
  > *Side profile view showcasing lightweight streamlined curve designed for 24/7 sleep tracking comfort, rear optical health sensor array.*
- **Ảnh Phụ 3 — Lớp Học Yoga Buổi Sáng Yên Bình (`xiaomi-smart-band-9-pro-lifestyle.jpg`)**:
  > *Wellness lifestyle: Xiaomi Smart Band 9 Pro on a woman's wrist in a yoga pose on a natural cork mat in a sunlit bamboo studio, soft serene morning atmosphere.*

---

### DANH MỤC 6: ĐIỆN THOẠI THÔNG MINH (Category Slug: `dien-thoai-di-dong`)

#### 31. iPhone 16 Pro Max Desert Titanium
- **Slug**: `iphone-16-pro-max-256gb`
- **Ảnh Chính (`iphone-16-pro-max-256gb-main.jpg`)**:
  > *Flagship studio commercial photography of iPhone 16 Pro Max in Desert Titanium finish. Phone angled upright showcasing the Dynamic Island on a borderless OLED display, alongside rear triple camera lenses with ceramic shield glass. Floating over a sand-toned travertine stone, luxury Apple aesthetic.*
- **Ảnh Phụ 1 — Cận Cảnh Nút Camera Control Mới (`iphone-16-pro-max-256gb-detail.jpg`)**:
  > *Extreme macro close-up of the flush sapphire crystal Camera Control button on the titanium side rail. Fine micro-brushed Grade 5 titanium texture, subtle capacitive sensor rim, ultra-sharp detail.*
- **Ảnh Phụ 2 — Cụm 3 Ống Kính Lăng Kính Tetraprism 5x (`iphone-16-pro-max-256gb-angle.jpg`)**:
  > *Rear perspective angle highlighting the triple camera module: 48MP Fusion lens, 5x telephoto tetraprism periscope lens, and LiDAR scanner recessed in matte color-infused back glass.*
- **Ảnh Phụ 3 — Nhiếp Ảnh Gia Trên Đường Phố Hoàng Hôn (`iphone-16-pro-max-256gb-lifestyle.jpg`)**:
  > *Street photography lifestyle: Hands holding iPhone 16 Pro Max in landscape orientation composing a photo of a golden sunset skyline over a modern city bridge.*

---

#### 32. Samsung Galaxy S25 Ultra Titanium Gray
- **Slug**: `samsung-galaxy-s25-ultra-12gb-512gb`
- **Ảnh Chính (`samsung-galaxy-s25-ultra-main.jpg`)**:
  > *Hero commercial studio shot of Samsung Galaxy S25 Ultra in Titanium Gray. The device stands proudly with slightly rounded ergonomic corners and flat anti-reflective Armor Aluminum/Titanium display, S-Pen resting beside it. Sleek gray pedestal, crisp studio lights.*
- **Ảnh Phụ 1 — Cận Cảnh Ống Kính 200MP & Khung Titanium Nhám (`samsung-galaxy-s25-ultra-detail.jpg`)**:
  > *Macro shot of the individual floating camera rings on the back of Galaxy S25 Ultra: textured metal rings encircling the 200MP main sensor and 50MP periscope zoom lens.*
- **Ảnh Phụ 2 — Đầu Bút S-Pen Rút Ra Từ Cạnh Đáy (`samsung-galaxy-s25-ultra-angle.jpg`)**:
  > *Perspective view of the bottom edge of Galaxy S25 Ultra showing the S-Pen stylus partially clicked out of its silo, USB-C port, and precision speaker slot.*
- **Ảnh Phụ 3 — Phác Thảo Ý Tưởng Tại Quán Cà Phê Hiện Đại (`samsung-galaxy-s25-ultra-lifestyle.jpg`)**:
  > *Lifestyle shot: A designer using the S-Pen on Galaxy S25 Ultra to sketch architectural blueprints on a wooden cafe table next to a notebook and iced latte.*

---

#### 33. Xiaomi 14 Ultra Leica Quad Camera
- **Slug**: `xiaomi-14-ultra-16gb-512gb`
- **Ảnh Chính (`xiaomi-14-ultra-main.jpg`)**:
  > *Commercial studio product photography of Xiaomi 14 Ultra in White nano-tech vegan leather with massive circular camera island and gold knurled ring. Back of phone facing camera with Leica branding prominently visible. Dark obsidian platform, dramatic studio lighting.*
- **Ảnh Phụ 1 — Cận Cảnh Vòng Bezel Khía Vàng & Logo Leica Chữ Đỏ (`xiaomi-14-ultra-detail.jpg`)**:
  > *Macro detail of the camera module: knurled golden bezel ring inspired by luxury wristwatches, iconic white Leica branding, and 1-inch Sony LYT-900 sensor glass element.*
- **Ảnh Phụ 2 — Mặt Da Sinh Học Nano-Tech & Khung Nhôm Liền Khối (`xiaomi-14-ultra-angle.jpg`)**:
  > *Low-angle side shot showing the gently curved back with anti-wear nano-leather texture blending seamlessly into the 6M42 high-strength aluminum frame.*
- **Ảnh Phụ 3 — Nhiếp Ảnh Nghệ Thuật Trong Studio Chụp Ảnh (`xiaomi-14-ultra-lifestyle.jpg`)**:
  > *Lifestyle photography: Xiaomi 14 Ultra mounted on a professional photography grip with shutter button, held by a photographer shooting a studio portrait with softbox lights.*

---

#### 34. HONOR Magic V5 Foldable
- **Slug**: `honor-magic-v5-16gb-512gb`
- **Ảnh Chính (`honor-magic-v5-main.jpg`)**:
  > *Commercial studio shot of the foldable flagship HONOR Magic V5 in Silk Brown finish. The phone is half-folded in Flex mode at 90 degrees on a polished reflective surface. Both inner expansive screen and outer display glowing with vivid HDR imagery, studio rim light.*
- **Ảnh Phụ 1 — Cận Cảnh Bản Lề Titan Bánh Răng Siêu Nhỏ (`honor-magic-v5-detail.jpg`)**:
  > *Macro close-up photo of the HONOR Magic V5 aerospace-grade titanium Luban hinge. Intricate micro-gears, polished metallic hinge spine, and gapless folding seam.*
- **Ảnh Phụ 2 — Độ Mỏng Đột Phá Khi Gập Lại Dưới 9mm (`honor-magic-v5-angle.jpg`)**:
  > *Horizontal side profile shot of Magic V5 completely folded flat, demonstrating its impossibly thin smartphone-like profile under 9mm, USB-C port, and volume rocker.*
- **Ảnh Phụ 3 — Doanh Nhân Đa Nhiệm Trên Chuyến Bay (`honor-magic-v5-lifestyle.jpg`)**:
  > *Business lifestyle: HONOR Magic V5 unfolded into tablet size on an airplane tray table, displaying side-by-side financial charts and video call in luxury cabin ambiance.*

---

#### 35. OPPO Find N3 Flip Hasselblad
- **Slug**: `oppo-find-n3-flip-12gb-256gb`
- **Ảnh Chính (`oppo-find-n3-flip-main.jpg`)**:
  > *Commercial product photography of OPPO Find N3 Flip in Cream Gold glossy glass. Phone standing folded in tent mode showing its intuitive vertical outer cover screen and circular Hasselblad triple camera module. Light beige marble background.*
- **Ảnh Phụ 1 — Cận Cảnh Cụm Camera Tròn Hasselblad & Khắc Chữ (`oppo-find-n3-flip-detail.jpg`)**:
  > *Macro shot of the Cosmos Ring camera deco with engraved Hasselblad logo, concentric CD-pattern light reflection disc, and precision multi-focal lenses.*
- **Ảnh Phụ 2 — Bản Lề Uốn Nếp Vô Hình Khi Mở Thẳng (`oppo-find-n3-flip-angle.jpg`)**:
  > *Close-up of the inner flexible AMOLED screen unfolded, demonstrating the virtually zero-crease Flexion Hinge surface under directional studio light.*
- **Ảnh Phụ 3 — Túi Xách Thời Trang & Đồ Phụ Kiện Phái Đẹp (`oppo-find-n3-flip-lifestyle.jpg`)**:
  > *Fashion lifestyle flatlay: Compact folded OPPO Find N3 Flip resting inside a designer leather mini bag alongside luxury lipstick and gold jewelry on a vanity mirror.*

---

#### 36. Nothing Phone 2A Plus Glyph Matrix
- **Slug**: `nothing-phone-2a-plus-5g-12gb-256gb`
- **Ảnh Chính (`nothing-phone-2a-plus-5g-12gb-256gb-main.jpg`)**:
  > *Hero studio product shot of Nothing Phone (2a) Plus in Metallic Grey transparent design. Transparent back glass reveals copper-tinted internal ribbons, dual centered camera 'eyes', and glowing white Glyph LED light strips. Dark techno-industrial backdrop.*
- **Ảnh Phụ 1 — Cận Cảnh Đèn LED Glyph Interface & Vít Cơ Khí (`nothing-phone-2a-plus-5g-12gb-256gb-detail.jpg`)**:
  > *Extreme macro detail of the Glyph Interface LED light strips illuminated with bright clean white light, intricate ribbon cables, circular NFC coil, and exposed torx screws under transparent back.*
- **Ảnh Phụ 2 — Góc Nghiêng Cụm Camera Đôi Đặt Giữa (`nothing-phone-2a-plus-5g-12gb-256gb-angle.jpg`)**:
  > *Three-quarter perspective view focusing on the symmetrical dual 50MP camera lenses nestled inside the circular NFC coil, resembling cartoon eyes, studio edge lighting.*
- **Ảnh Phụ 3 — Góc Bàn Công Nghệ Đèn Neon Tối Giản (`nothing-phone-2a-plus-5g-12gb-256gb-lifestyle.jpg`)**:
  > *Tech lifestyle: Nothing Phone (2a) Plus lying face-down on a matte black desk mat with its Glyph lights pulsing gently to an incoming notification, beside wireless earbuds and mechanical keypad.*

---

## 4. Tóm Tắt & Lưu Ý Khi Triển Khai Thực Tế

1. **Sinh ảnh với Google Flow / Imagen 3**:
   - Copy trực tiếp prompt tiếng Anh ở trên (Google Imagen 3 cho kết quả tối ưu nhất với prompt tiếng Anh giàu từ ngữ mô tả chất liệu và ánh sáng).
   - Thiết lập Aspect Ratio là `1:1` hoặc `4:5`.
2. **Lưu trữ & Ánh xạ CSDL**:
   - Tải về và đổi tên ảnh theo đúng định dạng `products/{slug}-main.jpg` và `products/gallery/{slug}-{detail|angle|lifestyle}.jpg`.
   - Di chuyển ảnh vào thư mục backend `uploads/products/` hoặc tải lên Supabase Storage bucket `ecommerce-images/products/`.
   - Dữ liệu seed trong backend `Ecommerce.Infrastructure` đã được lập trình sẵn khớp 100% với các tên file này.
