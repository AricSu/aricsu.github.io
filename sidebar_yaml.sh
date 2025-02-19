#!/bin/bash

# 读取 YAML 文件并提取数据
load_yaml_data() {
    echo "Reading YAML data from sidebar.yaml..."
    data=$(yq eval '.' ./docs/sidebar.yaml)
    echo "YAML data loaded successfully."
}

# 构建链接的函数
build_link() {
    local language="$1"
    local category_name_en="$2"
    local subcategory_name_en="$3"
    local file_name="$4"
    
    # 构建链接
    local base_path="/$language/tidb"
    echo "$base_path/$category_name_en/$subcategory_name_en/$file_name"
}

# 根据语言选择文本的函数
select_text() {
    local language="$1"
    local zh_text="$2"
    local en_text="$3"

    if [[ "$language" == "en" ]]; then
        echo "$en_text"
    else
        echo "$zh_text"
    fi
}

# 生成分类和子分类结构的函数
generate_category_items() {
    local language="$1"
    local category_group="$2"
    category_items="["

    # 获取子分类数据
    subcategories=$(echo "$category_group" | jq -c '.subcategories')

    # 遍历所有子分类
    for subcategory in $(echo "$subcategories" | jq -c '.[]'); do
        subcategory_name_zh=$(echo "$subcategory" | jq -r '.["name-zh"]')
        subcategory_name_en=$(echo "$subcategory" | jq -r '.["name-en"]')

        subsubcategories=$(echo "$subcategory" | jq -c '.subsubcategories')
        sub_items="["

        # 遍历子子分类
        for subsubcategory in $(echo "$subsubcategories" | jq -c '.[]'); do
            subsubcategory_name_zh=$(echo "$subsubcategory" | jq -r '.["name-zh"]')
            subsubcategory_name_en=$(echo "$subsubcategory" | jq -r '.["name-en"]')
            file_name=$(echo "$subsubcategory" | jq -r '.file')

            # 构建链接
            link=$(build_link "$language" "$category_name_en" "$subcategory_name_en" "$file_name")

            # 根据语言选择文本
            text=$(select_text "$language" "$subsubcategory_name_zh" "$subsubcategory_name_en")

            sub_items="$sub_items{\"text\": \"$text\", \"link\": \"$link\"},"
        done

        sub_items="${sub_items%,}]"

        # 添加子分类
        subcategory_text=$(select_text "$language" "$subcategory_name_zh" "$subcategory_name_en")
        category_items="$category_items{\"text\": \"$subcategory_text\", \"items\": $sub_items},"
    done

    category_items="${category_items%,}]"
    echo "$category_items"
}

# 生成侧边栏函数
generate_sidebar() {
    local language="$1"
    result="["

    # 提取 categories 数据
    categories=$(echo "$data" | jq -r '.tidb')

    # 遍历所有分类
    for category_group in $(echo "$categories" | jq -c '.[]'); do
        category_name_zh=$(echo "$category_group" | jq -r '.category["name-zh"]')
        category_name_en=$(echo "$category_group" | jq -r '.category["name-en"]')

        # 获取子分类和子子分类项
        category_items=$(generate_category_items "$language" "$category_group")

        # 根据语言选择分类文本
        category_text=$(select_text "$language" "$category_name_zh" "$category_name_en")

        result="$result{\"text\": \"$category_text\", \"items\": $category_items},"
    done

    result="${result%,}]"
    echo "$result"
}

# 输出 JavaScript 文件
save_sidebar() {
    local language="$1"
    local sidebar_data="$2"

    const_name="tidbDocSideBar$(echo $language | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
    file_name="./docs/.vitepress/sidebar_tidb_${language}.js"

    echo "export const $const_name = $sidebar_data;" > "$file_name"
    echo "Sidebar JavaScript has been successfully written to '$file_name'."
}

# 主函数
main() {
    # 读取数据
    load_yaml_data

    # 生成中文侧边栏
    sidebar_data_zh=$(generate_sidebar "zh")
    save_sidebar "zh" "$sidebar_data_zh"

    # 生成英文侧边栏
    sidebar_data_en=$(generate_sidebar "en")
    save_sidebar "en" "$sidebar_data_en"
}

# 执行主函数
main
