# Lex & Yacc concept and practice   
time: 2020-02-09   



> - [The_concept_of_Lex_and_Yacc](#The_concept_of_Lex_and_Yacc)     
> - [The_example_of_Lex_and_Yacc_of_Go](#The_example_of_Lex_and_Yacc_of_Go)     



## The_concept_of_Lex_and_Yacc  

 This part will introduce the basic knowledge about Lex & Yacc, reference from [Lex & yacc 's Document-Overview](http://dinosaur.compilertools.net/)

 - What does the compiler?  
   1. Read the source code and discover strcuture of it;  
   2. Process it from above to generate target programe as fragments;   
   3. The two step will individually working by Lex and Yacc;    

 - What is Lex most processing? 
   Split the source file into tokens by Lex;   

 - What is Yacc most processing?   
   Find the hierarchical structure of the source code;   

## The_example_of_Lex_and_Yacc_of_Go  

#### impliment_of_goyacc   

```shell
# init case go project
go mod init lex_and_yacc_case

# install the goyacc from github  
go get -u github.com/golang/tools/tree/master/cmd/goyacc

# test result of install action
$ goyacc -h
Usage of goyacc:
  -l    disable line directives
  -o string
        parser output (default "y.go")
  -p string
        name prefix to use in generated code (default "yy")
  -v string
        create parsing tables (default "y.output")
```
   
