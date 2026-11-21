import React from "react"
import styles from "./CartItems.module.css"

const CartItemsHeader = () => {
    return (
        <div className={`${styles.header} px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-card/60 text-tiny font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400`}>
            <h3>Sản phẩm công nghệ</h3>
            <h3 className="text-center">Đơn giá</h3>
            <h3 className="text-center">Số lượng</h3>
            <h3 className="text-right">Thành tiền</h3>
        </div>
    )
}

export default CartItemsHeader
