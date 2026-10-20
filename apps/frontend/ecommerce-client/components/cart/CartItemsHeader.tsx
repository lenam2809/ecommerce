import React from "react"

const CartItemsHeader = () => {
    return (
        <div className="hidden sm:grid grid-cols-12 gap-5 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090D16]/60 text-tiny font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <div className="col-span-6">
                <h3>Sản phẩm công nghệ</h3>
            </div>
            <div className="col-span-2 text-center">
                <h3>Đơn giá</h3>
            </div>
            <div className="col-span-2 text-center">
                <h3>Số lượng</h3>
            </div>
            <div className="col-span-2 text-right">
                <h3>Thành tiền</h3>
            </div>
        </div>
    )
}

export default CartItemsHeader
