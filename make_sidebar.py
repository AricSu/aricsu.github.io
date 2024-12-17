
#################################################################################################################################
# The script is just used to generated an sidebar list below.
# Author : Jan su
#################################################################################################################################
# const tidbDocSideBar = [{ 
#     text: '原理总结',
#     items: [
#         { text: '论文阅读', items: [
#             {text: 'Theory-Percolator分布式事务', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/Theory-Percolator分布式事务.md'},
#             {text: 'Theory-Spanner分布式事务', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/Theory-Spanner分布式事务.md'},
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'},
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'},
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'},
#         ] },
#         { text: '特性摘要', items: [
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'},
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'},
#             {text: 'PaperIsolationLevels学习笔记', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/PaperIsolationLevels学习笔记.md'}
#         ] },
#     ]
# },
#################################################################################################################################

import os

export_path = './docs/.vitepress/sidebar_tidb_zh.js'
file_path = r'./docs/zh/tidb'
split_path = r'./docs'

sidebar_list=[]

def clear(temp_export_path):
    if os.path.exists(temp_export_path):
        os.remove(temp_export_path)
    else:    
        print('no such file : %s'%temp_export_path)

def make_export_file(temp_export_path):
    file = open(temp_export_path,'w')
    file.close()	
    
def append_export_file(msg):
    with open(export_path,'a') as file:	
        file.writelines(msg + os.linesep)


def get_store_struct():
    if os.path.isdir(file_path):
        dir_res = os.listdir(file_path)
        for path in dir_res:
            sub_path = file_path+"/"+path
            # get out of `index.md/index.html` in current dir.
            if os.path.isdir(sub_path): 
                # print(path)
                dir_sub_res = os.listdir(sub_path)
                for dir_in_subdir in dir_sub_res:
                    if os.path.isdir(sub_path+"/"+dir_in_subdir):
                        # print("    "+dir_in_subdir)
                        files_in_sub_res = os.listdir(sub_path+"/"+dir_in_subdir)
                        for file in files_in_sub_res:
                            if os.path.isfile(sub_path+"/"+dir_in_subdir+"/"+file):
                                # print("        "+file)
                                sidebar_list.append((path, dir_in_subdir,file_path.split(split_path)[1]+"/"+path+"/"+dir_in_subdir+"/"+file))


def gen_sub_sidebar(sidebar_list):
    print('export default tidbDocZhSideBar = [')
    append_export_file('export default tidbDocZhSideBar = [')
    last_sidebar = ''
    last_sub_sidebar = ''
    for index, sidebar in enumerate(sidebar_list):
        if sidebar_list[index-1][1] != sidebar[1] and index != 0:
            print('            ] },')
            append_export_file('            ] },')
        if sidebar_list[index-1][0] != sidebar[0] and index != 0:
            print('    ] },')
            append_export_file('    ] },')
        if last_sidebar != sidebar[0]:
            print('    {text: "'+sidebar[0][2:]+'", items: [')
            append_export_file('    {text: "'+sidebar[0][2:]+'", items: [')
        last_sidebar=sidebar[0]
        if last_sub_sidebar != sidebar[1]:
            print('            { text: "'+sidebar[1][3:]+'", items: [')
            append_export_file('            { text: "'+sidebar[1][3:]+'", items: [')
        last_sub_sidebar=sidebar[1]
        sub_item = sidebar[2].split('/')[5][2:].split('.md')[0]
        # {text: 'Theory-Percolator分布式事务', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/Theory-Percolator分布式事务.md'},
        print('                { text: "'+sub_item+'", link: "'+sidebar[2]+'"},')
        append_export_file('                { text: "'+sub_item+'", link: "'+sidebar[2]+'"},')
        # output end flag
        if len(sidebar_list) - 1 == index:
            continue
    print('            ] },')
    append_export_file('            ] },')
    print('    ] }')
    append_export_file('    ] }')
    print(']')
    append_export_file(']')

        
        
    
clear(export_path)
make_export_file(export_path)
get_store_struct()
sidebar_list.sort()
gen_sub_sidebar(sidebar_list)


#################################################################################################################################
# Generate new sidebar about tidb of english notes
#################################################################################################################################


import os

export_path = './docs/.vitepress/sidebar_tidb_en.js'
file_path = r'./docs/en/tidb'
split_path = r'./docs'

sidebar_list=[]

def clear(temp_export_path):
    if os.path.exists(temp_export_path):
        os.remove(temp_export_path)
    else:    
        print('no such file : %s'%temp_export_path)

def make_export_file(temp_export_path):
    file = open(temp_export_path,'w')
    file.close()	
    
def append_export_file(msg):
    with open(export_path,'a') as file:	
        file.writelines(msg + os.linesep)


def get_store_struct():
    if os.path.isdir(file_path):
        dir_res = os.listdir(file_path)
        for path in dir_res:
            sub_path = file_path+"/"+path
            # get out of `index.md/index.html` in current dir.
            if os.path.isdir(sub_path): 
                # print(path)
                dir_sub_res = os.listdir(sub_path)
                for dir_in_subdir in dir_sub_res:
                    if os.path.isdir(sub_path+"/"+dir_in_subdir):
                        # print("    "+dir_in_subdir)
                        files_in_sub_res = os.listdir(sub_path+"/"+dir_in_subdir)
                        for file in files_in_sub_res:
                            if os.path.isfile(sub_path+"/"+dir_in_subdir+"/"+file):
                                # print("        "+file)
                                sidebar_list.append((path, dir_in_subdir,file_path.split(split_path)[1]+"/"+path+"/"+dir_in_subdir+"/"+file))


def gen_sub_sidebar(sidebar_list):
    print('export default tidbDocZhSideBar = [')
    append_export_file('export default tidbDocZhSideBar = [')
    last_sidebar = ''
    last_sub_sidebar = ''
    for index, sidebar in enumerate(sidebar_list):
        if sidebar_list[index-1][1] != sidebar[1] and index != 0:
            print('            ] },')
            append_export_file('            ] },')
        if sidebar_list[index-1][0] != sidebar[0] and index != 0:
            print('    ] },')
            append_export_file('    ] },')
        if last_sidebar != sidebar[0]:
            print('    {text: "'+sidebar[0][2:]+'", items: [')
            append_export_file('    {text: "'+sidebar[0][2:]+'", items: [')
        last_sidebar=sidebar[0]
        if last_sub_sidebar != sidebar[1]:
            print('            { text: "'+sidebar[1][3:]+'", items: [')
            append_export_file('            { text: "'+sidebar[1][3:]+'", items: [')
        last_sub_sidebar=sidebar[1]
        sub_item = sidebar[2].split('/')[5][2:].split('.md')[0]
        # {text: 'Theory-Percolator分布式事务', link: '/zh/tidb/01TiDB-原理总结/1-1论文阅读/Theory-Percolator分布式事务.md'},
        print('                { text: "'+sub_item+'", link: "'+sidebar[2]+'"},')
        append_export_file('                { text: "'+sub_item+'", link: "'+sidebar[2]+'"},')
        # output end flag
        if len(sidebar_list) - 1 == index:
            continue
    print('            ] },')
    append_export_file('            ] },')
    print('    ] }')
    append_export_file('    ] }')
    print(']')
    append_export_file(']')

        
        
    
clear(export_path)
make_export_file(export_path)
get_store_struct()
sidebar_list.sort()
gen_sub_sidebar(sidebar_list)


#################################################################################################################################
# Generate new sidebar about english notes
#################################################################################################################################

export_path = './docs/.vitepress/sidebar_english_en.js'
file_path = r'./docs/en/english'
sidebar_list=[]

def get_store_struct():
    if os.path.isdir(file_path):
        dir_res = os.listdir(file_path)
        for path in dir_res:
            sub_path = file_path+"/"+path
            # get out of `index.md/index.html` in current dir.
            if os.path.isdir(sub_path): 
                # print(path)
                dir_sub_res = os.listdir(sub_path)
                for file in dir_sub_res:
                    if os.path.isfile(sub_path+"/"+file) and file != "index.md":
                        # print("        "+file)
                        sidebar_list.append((path,file_path.split(split_path)[1]+"/"+path+"/"+file))

def gen_sub_sidebar(sidebar_list):
    print('export default englishDocEnSideBar = [')
    append_export_file('export default englishDocEnSideBar = [')
    last_sidebar = ''
    last_sub_sidebar = ''
    for index, sidebar in enumerate(sidebar_list):
        if sidebar_list[index-1][0] != sidebar[0] and index != 0:
            print('    ] },')
            append_export_file('    ] },')
        if last_sidebar != sidebar[0]:
            print('    {text: "'+sidebar[0][2:]+'", items: [')
            append_export_file('    {text: "'+sidebar[0][2:]+'", items: [')
        last_sidebar=sidebar[0]
        if last_sub_sidebar != sidebar[1]:
            print('            { text: "scenario_'+sidebar[1].split('/')[4].split('.md')[0].split('_')[1]+'", link: "'+sidebar[1]+'"},')
            append_export_file('            { text: "scenario_'+sidebar[1].split('/')[4].split('.md')[0].split('_')[1]+'", link: "'+sidebar[1]+'"},')
        last_sub_sidebar=sidebar[1]
        # output end flag
        if len(sidebar_list) - 1 == index:
            continue
    print('    ] }')
    append_export_file('    ] }')
    print(']')
    append_export_file(']')


clear(export_path)
make_export_file(export_path)
get_store_struct()
sidebar_list.sort()
gen_sub_sidebar(sidebar_list)




#################################################################################################################################
# Generate new sidebar about chinese notes about english learning
#################################################################################################################################

export_path = './docs/.vitepress/sidebar_english_zh.js'
file_path = r'./docs/zh/english'
sidebar_list=[]

def get_store_struct():
    if os.path.isdir(file_path):
        dir_res = os.listdir(file_path)
        for path in dir_res:
            sub_path = file_path+"/"+path
            # get out of `index.md/index.html` in current dir.
            if os.path.isdir(sub_path): 
                # print(path)
                dir_sub_res = os.listdir(sub_path)
                for file in dir_sub_res:
                    if os.path.isfile(sub_path+"/"+file) and file != "index.md":
                        # print("        "+file)
                        sidebar_list.append((path,file_path.split(split_path)[1]+"/"+path+"/"+file))

def gen_sub_sidebar(sidebar_list):
    print('export default englishDocEnSideBar = [')
    append_export_file('export default englishDocEnSideBar = [')
    last_sidebar = ''
    last_sub_sidebar = ''
    for index, sidebar in enumerate(sidebar_list):
        if sidebar_list[index-1][0] != sidebar[0] and index != 0:
            print('    ] },')
            append_export_file('    ] },')
        if last_sidebar != sidebar[0]:
            print('    {text: "'+sidebar[0][2:]+'", items: [')
            append_export_file('    {text: "'+sidebar[0][2:]+'", items: [')
        last_sidebar=sidebar[0]
        if last_sub_sidebar != sidebar[1]:
            print('            { text: "场景_'+sidebar[1].split('/')[4].split('.md')[0].split('_')[1]+'", link: "'+sidebar[1]+'"},')
            append_export_file('            { text: "场景_'+sidebar[1].split('/')[4].split('.md')[0].split('_')[1]+'", link: "'+sidebar[1]+'"},')
        last_sub_sidebar=sidebar[1]
        # output end flag
        if len(sidebar_list) - 1 == index:
            continue
    print('    ] }')
    append_export_file('    ] }')
    print(']')
    append_export_file(']')


clear(export_path)
make_export_file(export_path)
get_store_struct()
sidebar_list.sort()
gen_sub_sidebar(sidebar_list)