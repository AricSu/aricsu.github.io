import yaml
import json

def generate_sidebar(data, language):
    result = []
    
    for category_group in data.get('tidb', []):
        category = category_group.get('category', {})
        category_name_zh = category.get('name-zh', '')
        category_name_en = category.get('name-en', '')
        
        # 根据 language 参数确定 base_path
        base_path = f'/{language}/tidb' if category_name_en else f'/{language}/tidb'
        
        subcategories = category_group.get('subcategories', [])
        category_items = []

        for subcategory in subcategories:
            subcategory_name_zh = subcategory.get('name-zh', '')
            subcategory_name_en = subcategory.get('name-en', '')
            
            subsubcategories = subcategory.get('subsubcategories', [])
            sub_items = []

            for subsubcategory in subsubcategories:
                subsubcategory_name_zh = subsubcategory.get('name-zh', '')
                subsubcategory_name_en = subsubcategory.get('name-en', '')
                file_name = subsubcategory.get('file', '')
                
                # 构建链接
                link = f"{base_path}/{category_name_en}/{subcategory_name_en}/{file_name}"

                sub_items.append({
                    "text": subsubcategory_name_en if language == 'en' else subsubcategory_name_zh,  # 根据语言选择显示内容
                    "link": link
                })

            # 添加子分类
            category_items.append({
                "text": subcategory_name_en if language == 'en' else subcategory_name_zh,  # 根据语言选择显示内容
                "items": sub_items
            })

        # 添加分类
        result.append({
            "text": category_name_en if language == 'en' else category_name_zh,  # 根据语言选择显示内容
            "items": category_items
        })
    
    return result

def save_sidebar(data, language):
    # 调用生成 sidebar 的函数
    sidebar_data = generate_sidebar(data, language)

    # 将 Python 字典转换为格式化的 JSON 字符串
    output_content = json.dumps(sidebar_data, indent=4, ensure_ascii=False)

    # 根据语言生成不同的常量名
    const_name = 'tidbDocSideBarZh' if language == 'zh' else 'tidbDocSideBarEn'
    
    # 根据语言生成不同的文件
    file_name = f'./docs/.vitepress/sidebar_tidb_{language}.js'
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(f"export const {const_name} = {output_content};\n")

    print(f"Sidebar JavaScript has been successfully written to '{file_name}'.")

# 读取 YAML 文件
with open('./docs/sidebar.yaml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

# 生成中文和英文的 sidebar 文件
save_sidebar(data, 'zh')  # 生成 sidebar_tidb_zh.js
save_sidebar(data, 'en')  # 生成 sidebar_tidb_en.js
