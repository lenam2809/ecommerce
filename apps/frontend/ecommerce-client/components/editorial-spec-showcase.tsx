import { ShieldCheck } from "lucide-react"

/**
 * EditorialSpecShowcase — "Chuẩn mực mới của thiết bị thông minh"
 * Trích xuất từ Stitch Technical Specification Editorial Showcase
 */
export function EditorialSpecShowcase() {
  const specs = [
    {
      label: "Vật Liệu Khung",
      value: "Titanium Khắc Cực Siêu Nhẹ & Ceramic Chống Xước",
    },
    {
      label: "Kết Nối Chuẩn",
      value: "Wi-Fi 7, Bluetooth 5.4, UWB Ultra-Wideband Thế Hệ 2",
    },
    {
      label: "Âm Học Kỹ Thuật Số",
      value: "Lossless Audio 24-bit/192kHz kèm Khử Tiếng Ồn Thích Ứng",
    },
    {
      label: "Thời Lượng Pin",
      value: "Tối đa 36 giờ sử dụng liên tục · Sạc nhanh 50% trong 20 phút",
    },
    {
      label: "Chứng Nhận Xanh",
      value: "100% Nhôm và Đất Hiếm Tái Chế · Đóng Gói Không Rác Nhựa",
    },
  ]

  return (
    <section className="container-app py-14 md:py-20">
      <div className="bg-surface rounded-3xl p-8 md:p-14 border border-line transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Cột trái: Giới thiệu triết lý kỹ nghệ */}
          <div className="lg:col-span-5">
            <span className="text-tiny font-bold uppercase tracking-widest text-brand inline-block">
              KỸ NGHỆ CHẾ TÁC
            </span>
            <h2 className="text-h2 font-bold tracking-tight text-ink mt-2 mb-5 leading-tight">
              Chuẩn mực mới của thiết bị thông minh.
            </h2>
            <p className="text-small text-ink-soft mb-8 leading-relaxed">
              Mỗi sản phẩm tại ShopViet đều trải qua quy trình đánh giá khắt khe về độ bền, độ trễ xử lý và khả năng tích hợp không dây liền mạch trong không gian sống Việt Nam.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div
                  className="w-10 h-10 rounded-full border-2 border-background bg-ink text-background flex items-center justify-center font-bold text-xs shadow-xs"
                  title="Kiểm định tại Việt Nam"
                >
                  VN
                </div>
                <div
                  className="w-10 h-10 rounded-full border-2 border-background bg-brand text-white flex items-center justify-center font-bold text-xs shadow-xs"
                  title="Tối ưu trí tuệ nhân tạo AI"
                >
                  AI
                </div>
                <div
                  className="w-10 h-10 rounded-full border-2 border-background bg-surface-2 text-ink flex items-center justify-center shadow-xs"
                  title="Bảo hành chính hãng an tâm"
                >
                  <ShieldCheck className="h-4 w-4 text-brand" />
                </div>
              </div>
              <span className="text-small font-medium text-ink">
                Bảo chứng chất lượng bởi chuyên gia công nghệ
              </span>
            </div>
          </div>

          {/* Cột phải: Bảng thông số kỹ thuật biên tập */}
          <div className="lg:col-span-7 bg-background rounded-2xl p-6 md:p-8 border border-line shadow-xs">
            <table className="w-full text-left border-collapse">
              <tbody>
                {specs.map((item, index) => (
                  <tr
                    key={item.label}
                    className={`${
                      index !== specs.length - 1 ? "border-b border-line/70" : ""
                    } transition-colors`}
                  >
                    <td className="py-4 pr-4 text-tiny md:text-small text-ink-faint uppercase font-semibold w-1/3 align-top tracking-wider">
                      {item.label}
                    </td>
                    <td className="py-4 text-small md:text-base font-semibold text-ink align-top leading-snug">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
