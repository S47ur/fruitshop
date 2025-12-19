"""
生成水果店进销存系统 ER 图
运行: python generate_er.py
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as path_effects

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

def draw_entity(ax, x, y, name, fields, color='#E3F2FD', title_color='#1976D2'):
    """绘制实体框"""
    width = 2.2
    row_height = 0.35
    height = (len(fields) + 1) * row_height + 0.2
    
    # 主体框
    rect = FancyBboxPatch((x, y - height), width, height,
                          boxstyle="round,pad=0.02,rounding_size=0.1",
                          facecolor=color, edgecolor='#666', linewidth=1.5)
    ax.add_patch(rect)
    
    # 标题背景
    title_rect = FancyBboxPatch((x, y - row_height - 0.1), width, row_height + 0.1,
                                boxstyle="round,pad=0.02,rounding_size=0.1",
                                facecolor=title_color, edgecolor='none')
    ax.add_patch(title_rect)
    
    # 标题文字
    ax.text(x + width/2, y - row_height/2 - 0.05, name,
            ha='center', va='center', fontsize=9, fontweight='bold', color='white')
    
    # 字段
    for i, (field, pk) in enumerate(fields):
        field_y = y - (i + 2) * row_height
        prefix = "🔑 " if pk else "   "
        ax.text(x + 0.1, field_y, prefix + field,
                ha='left', va='center', fontsize=7, color='#333')
    
    return x + width/2, y - height/2  # 返回中心点

def draw_relation(ax, start, end, label="", style='->'):
    """绘制关系线"""
    ax.annotate('', xy=end, xytext=start,
                arrowprops=dict(arrowstyle=style, color='#666', lw=1.2,
                               connectionstyle="arc3,rad=0.1"))
    if label:
        mid_x = (start[0] + end[0]) / 2
        mid_y = (start[1] + end[1]) / 2
        ax.text(mid_x, mid_y + 0.2, label, fontsize=6, ha='center', color='#666')

# 创建图形
fig, ax = plt.subplots(1, 1, figsize=(20, 14))
ax.set_xlim(-1, 21)
ax.set_ylim(-12, 2)
ax.set_aspect('equal')
ax.axis('off')

# 标题
ax.text(10, 1, '🍎 水果店进销存系统 - 数据库 ER 图', 
        fontsize=18, fontweight='bold', ha='center', color='#333')
ax.text(10, 0.3, 'FruitShop Database Entity-Relationship Diagram', 
        fontsize=10, ha='center', color='#666')

# ========== 第一行：用户与门店 ==========
users_fields = [("username", True), ("password", False), ("name", False), ("role", False), ("email", False)]
stores_fields = [("id", True), ("name", False), ("city", False), ("address", False), ("phone", False)]
user_stores_fields = [("username", True), ("store_id", True)]

draw_entity(ax, 0, -1, "USERS 用户", users_fields, '#E8F5E9', '#4CAF50')
draw_entity(ax, 3.5, -1, "USER_STORES", user_stores_fields, '#FFF3E0', '#FF9800')
draw_entity(ax, 7, -1, "STORES 门店", stores_fields, '#E3F2FD', '#2196F3')

# ========== 第二行：商品与合作伙伴 ==========
products_fields = [("id", True), ("name", False), ("category", False), ("price_base", False), ("status", False)]
partners_fields = [("id", True), ("type", False), ("name", False), ("contact", False), ("payment_term", False)]

draw_entity(ax, 0, -5, "PRODUCTS 商品", products_fields, '#FCE4EC', '#E91E63')
draw_entity(ax, 7, -5, "PARTNERS 合作伙伴", partners_fields, '#F3E5F5', '#9C27B0')

# ========== 第三行：库存管理 ==========
inventory_fields = [("id", True), ("store_id", False), ("product_id", False), ("on_hand_kg", False), 
                   ("unit_cost", False), ("unit_price", False), ("reorder_level", False)]
adjustments_fields = [("id", True), ("inventory_id", False), ("reason", False), ("delta_kg", False), ("created_at", False)]

draw_entity(ax, 3.5, -5, "INVENTORY 库存", inventory_fields, '#FFFDE7', '#FFC107')
draw_entity(ax, 3.5, -9.5, "ADJUSTMENTS 调整", adjustments_fields, '#FFF8E1', '#FFB300')

# ========== 第四列：采购管理 ==========
purchase_fields = [("id", True), ("store_id", False), ("supplier_id", False), ("status", False), ("expected_date", False)]
po_lines_fields = [("id", True), ("order_id", False), ("product_id", False), ("quantity", False), ("unit_cost", False)]

draw_entity(ax, 11, -1, "PURCHASE_ORDERS 采购单", purchase_fields, '#E0F7FA', '#00BCD4')
draw_entity(ax, 11, -5, "PO_LINES 采购明细", po_lines_fields, '#E0F2F1', '#009688')

# ========== 第五列：销售管理 ==========
sales_fields = [("id", True), ("store_id", False), ("customer_id", False), ("date", False), 
               ("quantity_kg", False), ("unit_price", False), ("status", False)]
invoices_fields = [("id", True), ("store_id", False), ("order_id", False), ("amount", False), ("status", False)]

draw_entity(ax, 15, -1, "SALES_ORDERS 销售单", sales_fields, '#FFEBEE', '#F44336')
draw_entity(ax, 15, -5.5, "INVOICES 发票", invoices_fields, '#FFCDD2', '#EF5350')

# ========== 第六列：会员与系统 ==========
members_fields = [("id", True), ("name", False), ("phone", False), ("balance", False), ("points", False), ("tier", False)]
role_fields = [("role", True), ("label", False)]
params_fields = [("param_key", True), ("param_value", False), ("description", False)]
audit_fields = [("id", True), ("actor", False), ("action", False), ("entity", False), ("timestamp", False)]

draw_entity(ax, 19, -1, "MEMBERS 会员", members_fields, '#E8EAF6', '#3F51B5')
draw_entity(ax, 19, -5, "ROLE_MATRIX 角色", role_fields, '#ECEFF1', '#607D8B')
draw_entity(ax, 11, -9.5, "SYSTEM_PARAMS 参数", params_fields, '#EFEBE9', '#795548')
draw_entity(ax, 15, -9.5, "AUDIT_LOGS 审计", audit_fields, '#FAFAFA', '#9E9E9E')

# ========== 绘制关系线 ==========
# 用虚线和实线表示关系
from matplotlib.lines import Line2D

# USERS -> USER_STORES
ax.annotate('', xy=(3.5, -2), xytext=(2.2, -2),
            arrowprops=dict(arrowstyle='->', color='#4CAF50', lw=2))
ax.text(2.85, -1.7, '1:N', fontsize=8, color='#4CAF50', fontweight='bold')

# STORES -> USER_STORES  
ax.annotate('', xy=(5.7, -2), xytext=(7, -2),
            arrowprops=dict(arrowstyle='->', color='#2196F3', lw=2))
ax.text(6.1, -1.7, '1:N', fontsize=8, color='#2196F3', fontweight='bold')

# PRODUCTS -> INVENTORY
ax.annotate('', xy=(3.5, -5.5), xytext=(2.2, -5.5),
            arrowprops=dict(arrowstyle='->', color='#E91E63', lw=2))

# STORES -> INVENTORY
ax.annotate('', xy=(4.6, -4), xytext=(7.5, -4),
            arrowprops=dict(arrowstyle='->', color='#2196F3', lw=2, 
                           connectionstyle="arc3,rad=-0.3"))

# INVENTORY -> ADJUSTMENTS
ax.annotate('', xy=(4.6, -9.5), xytext=(4.6, -8),
            arrowprops=dict(arrowstyle='->', color='#FFC107', lw=2))
ax.text(4.8, -8.7, '1:N', fontsize=8, color='#FFC107', fontweight='bold')

# STORES -> PURCHASE_ORDERS
ax.annotate('', xy=(11, -2), xytext=(9.2, -2),
            arrowprops=dict(arrowstyle='->', color='#2196F3', lw=2))

# PARTNERS -> PURCHASE_ORDERS
ax.annotate('', xy=(11.5, -4), xytext=(9.2, -5.5),
            arrowprops=dict(arrowstyle='->', color='#9C27B0', lw=2,
                           connectionstyle="arc3,rad=-0.2"))
ax.text(10, -4.5, '供应', fontsize=7, color='#9C27B0')

# PURCHASE_ORDERS -> PO_LINES
ax.annotate('', xy=(12.1, -5), xytext=(12.1, -4),
            arrowprops=dict(arrowstyle='->', color='#00BCD4', lw=2))
ax.text(12.3, -4.5, '1:N', fontsize=8, color='#00BCD4', fontweight='bold')

# STORES -> SALES_ORDERS
ax.annotate('', xy=(15, -2.5), xytext=(9.2, -2.5),
            arrowprops=dict(arrowstyle='->', color='#2196F3', lw=2,
                           connectionstyle="arc3,rad=0.2"))

# PARTNERS -> SALES_ORDERS
ax.annotate('', xy=(15.5, -4.5), xytext=(9.2, -6),
            arrowprops=dict(arrowstyle='->', color='#9C27B0', lw=2,
                           connectionstyle="arc3,rad=0.2"))
ax.text(12, -5, '客户', fontsize=7, color='#9C27B0')

# SALES_ORDERS -> INVOICES
ax.annotate('', xy=(16.1, -5.5), xytext=(16.1, -4.5),
            arrowprops=dict(arrowstyle='->', color='#F44336', lw=2))
ax.text(16.3, -5, '1:1', fontsize=8, color='#F44336', fontweight='bold')

# 图例
legend_elements = [
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#4CAF50', markersize=10, label='用户管理'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#2196F3', markersize=10, label='门店管理'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#FFC107', markersize=10, label='库存管理'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#00BCD4', markersize=10, label='采购管理'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#F44336', markersize=10, label='销售管理'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#3F51B5', markersize=10, label='会员系统'),
    Line2D([0], [0], marker='s', color='w', markerfacecolor='#607D8B', markersize=10, label='系统配置'),
]
ax.legend(handles=legend_elements, loc='lower right', fontsize=8, ncol=4)

# 版权信息
ax.text(10, -11.5, '🔑 = 主键 (Primary Key)   |   箭头表示外键关系   |   1:N = 一对多关系', 
        fontsize=9, ha='center', color='#666')

plt.tight_layout()
plt.savefig('d:/spring/fruitshop/docs/ER_DIAGRAM.png', dpi=150, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.savefig('d:/spring/fruitshop/docs/ER_DIAGRAM.svg', format='svg', bbox_inches='tight',
            facecolor='white', edgecolor='none')
print("✅ ER 图已生成:")
print("   - d:/spring/fruitshop/docs/ER_DIAGRAM.png")
print("   - d:/spring/fruitshop/docs/ER_DIAGRAM.svg")
