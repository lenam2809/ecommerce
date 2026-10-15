import React from "react"

const CartItemsHeader = () => {
    return (
        <div className="hidden sm:grid grid-cols-12 gap-6 px-5 py-3 border-b border-line/60 bg-surface-2/40 text-tiny font-semibold uppercase tracking-wider text-ink-faint">
            <div className="col-span-6">
                <h3>Sản phẩm</h3>
            </div>
            <div className="col-span-2 text-center">
                <h3>Đơn giá</h3>
            </div>
            <div className="col-span-2 text-center">
                <h3>Số lượng</h3>
            </div>
            <div className="col-span-2 text-right">
                <h3>Tạm tính</h3>
            </div>
        </div>
    )
}

export default CartItemsHeader
