---
title: "文件操作"
description: "文件读写有 C 风格的 <cstdio> 函数和 C++ 的 fstream 两套接口；竞赛里最常用的是用 freopen 把输入输出重定向到文件。"
---
# 文件操作

程序的数据来源要么是键盘，要么是文件；运行结果要么打在屏幕上，要么写进文件。前面各章一直用 `cin`/`cout` 跟键盘、屏幕打交道，这一章讲怎么把程序接到文件上。

C++ 里操作文件有两套接口。一套是 C 传下来的，原型都在 `<cstdio>`（等价于 C 的 `<stdio.h>`，只是把名字放进 `std` 命名空间），核心是一个 `FILE*` 指针加一组 `f` 开头的函数；另一套是 C++ 自己的 `<fstream>`，用 `ifstream`/`ofstream` 对象，读写语法和 `cin`/`cout` 完全一致。两套都能用，竞赛里也都会遇到。

竞赛中文件操作的常见用法有两种：用 `freopen` 把输入输出重定向到文件，或者用 `ifstream`/`ofstream` 打开文件。`fgetc`、`fwrite`、`fseek` 等函数多数情况下只需能够读懂，本章仍按顺序列出。

## 竞赛里怎么用文件

本节介绍 `freopen` 重定向。

本地调试时，输入从键盘改成文件 `in.txt`，输出从屏幕改成文件 `out.txt`，只要在 `main` 开头加两行：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    freopen("in.txt", "r", stdin);    // 输入改从 in.txt 读
    freopen("out.txt", "w", stdout);  // 输出改往 out.txt 写

    int a, b;
    cin >> a >> b;            // 照常写 cin，数据其实来自 in.txt
    cout << a + b << '\n';    // 照常写 cout，结果其实写进 out.txt
    return 0;
}
```

`freopen` 改的是 `stdin` 和 `stdout` 指向的文件，而 `cin`/`cout` 默认与它们保持同步，所以重定向之后 `cin`/`cout` 照常能用，同一份代码可以在调试时读文件、提交时读键盘。

提交到评测机前必须去掉这两行，否则程序会去找根本不存在的 `in.txt`，直接运行失败。常见做法是用条件编译隔离，本地编译时加 `-DLOCAL` 才生效：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
    freopen("out.txt", "w", stdout);
#endif

    int n;
    cin >> n;
    cout << n << '\n';
    return 0;
}
```

```bash
g++ -std=c++17 -O2 -DLOCAL -o sol sol.cpp   # 本地：重定向生效
g++ -std=c++17 -O2 -o sol sol.cpp           # 提交：重定向被跳过
```

部分题目在题面里规定了输入输出文件名，此时按规定的文件名调用 `freopen`。

另一种方式是用 C++ 的 `ifstream`/`ofstream` 直接打开文件，适用于同时打开多个文件或逐行读取后再解析的场合。这套写法在 `freopen` 一节之后单独介绍。

## 文件指针

`<cstdio>` 里定义了一个 `FILE` 结构（structure），记录操作一个文件所需要的全部信息。C 风格的文件函数全都通过它工作。

操作文件之前，先声明一个指向 `FILE` 的指针，用它保存文件信息：

```cpp
FILE* fp;
```

`FILE` 结构内部记着这些内容：文件当前的读写位置、读写是否出错的记录、文件结尾指示器、缓冲区起始位置的指针、文件标识符、一个统计已拷贝进缓冲区的字节数的计数器等等。拿到指针以后，后续操作都用这个指针（而不是文件名）来指定文件。

下面是读取一个文件的完整程序：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("hello.txt", "r");
    if (fp == nullptr) {
        return -1;              // 打开失败，直接退出
    }

    int c = fgetc(fp);          // 读一个字符，返回值是 int 而不是 char
    if (c != EOF) {
        cout << (char) c << '\n';
    }

    fclose(fp);                 // 用完关闭

    return 0;
}
```

这个程序分三步，其他文件操作大致也是这三步。

第一步，用 `fopen()` 打开文件，返回一个 `FILE` 指针。它与文件建立关联，同时分配一块缓冲区（buffer）。带缓冲的读写序列称为“流”（stream），`fopen()` 的返回值即代表一个流。

第二步，用读写函数处理数据。上例用的是 `fgetc()`，从打开的文件里读一个字符。它一次调用并不真的每次去磁盘取一个字节，而是先把一整块数据拷进缓冲区，再从缓冲区取字符；不同的机器缓冲区大小不同，一般是 512 字节或它的倍数（4096、16384 之类），随着硬盘越来越大，缓冲区也比过去更大。每读一个字符，文件内部记录读写位置的指示器就往后挪一格；同一个文件上的所有读取函数共用同一个指示器，所以下一次读总是接着上一次停下的位置继续。缓冲区里的字符读完了，函数就去文件里拷下一块进来，如此直到文件结尾。

第三步，用 `fclose()` 关闭文件，同时清空缓冲区。

读到最后时，函数把 `FILE` 结构里的文件结尾指示器置为真，之后任何读取函数都会返回常量 `EOF`。写文件的过程是对称的：数据先写进缓冲区，缓冲区写满后整块转移到文件里。

## fopen()

`fopen()` 用来打开文件，是所有 C 风格文件操作的第一步。原型定义在 `<cstdio>`：

```cpp
FILE* fopen(const char* filename, const char* mode);
```

它接受两个参数：文件名（可以带路径）和模式字符串。比如下面这个例子，`"r"` 表示以读取模式打开：

```cpp
fp = fopen("in.dat", "r");
```

成功时返回一个 `FILE` 指针，其他函数就用它操作文件；打不开时（文件不存在、没有权限、路径写错）返回空指针。C 里这个空指针写作 `NULL`，C++ 中通常写作 `nullptr`。**每次 `fopen` 之后都应该判空**，不判就直接用，是段错误的高发区。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("hello.txt", "r");
    if (fp == nullptr) {
        cout << "Can't open file!\n";
        return 1;               // 也可以写成 exit(EXIT_FAILURE);
    }

    // ... 用 fp 读写
    fclose(fp);
    return 0;
}
```

模式字符串有以下几种。

- `r`：读模式，只用来读数据。文件不存在就返回空指针。
- `w`：写模式，只用来写数据。文件已存在，长度先被截为 0 再写；文件不存在则新建。
- `a`：写模式，只在文件尾部追加数据。文件不存在则新建。
- `r+`：读写模式。文件存在时指针指向开头，可在文件头部添加数据；文件不存在则返回空指针。
- `w+`：读写模式。文件存在时长度先被截为 0，再写数据。该模式读不到原有数据，原有数据会被清除；文件不存在则新建。
- `a+`：读写模式。文件存在时指针指向末尾，可以在文件末尾追加内容；文件不存在则新建。

读模式建的是读缓冲区，写模式建的是写缓冲区，读写模式会同时建两个。C 语言就是靠缓冲区，以流的形式向文件读写数据。

数据在文件里一律以二进制形式存储，读的时候有两种解读方式：按原本的二进制解读，叫“二进制流”；把二进制转成文本再解读，叫“文本流”。写也一样，分二进制写入和文本写入，后者多一步文本转二进制。模式字符串默认按文本流读写；加上后缀 `b`（binary）就按二进制流读写，比如 `rb` 是读二进制、`wb` 是写二进制。

模式字符串还有一个后缀 `x`，表示独占模式（exclusive）：文件已存在则打开失败，不存在则新建，且打开后不允许别的程序或线程访问。比如 `wx` 以独占模式写，文件已存在就直接失败。

## 标准流

操作系统默认提供三个已经打开的文件，对应三个文件指针：

- `stdin`（标准输入）：默认来源是键盘，文件描述符编号为 `0`。
- `stdout`（标准输出）：默认目的地是显示器，文件描述符编号为 `1`。
- `stderr`（标准错误）：默认目的地是显示器，文件描述符编号为 `2`。

这三个文件不一定是数据文件，也可以是设备文件——一个文件代表一台可读写的设备。`stdin` 默认把键盘看作文件，读它就等于读键盘输入；`stdout` 和 `stderr` 默认把显示器看作文件，往它们写就等于在屏幕上打印。两者的分工是：`stdout` 输出程序的正常结果，`stderr` 输出报错信息。因为实现方式相同，都是文件流，所以合称“标准流”。

标准流指向的文件可以改变，这叫重定向（redirection），在命令行里用符号完成。

输入重定向用小于号 `<`，写在程序名后面：

```bash
./demo < in.dat
```

这样 `demo` 里的 `stdin` 就指向 `in.dat`，从文件读数据。

输出重定向用大于号 `>`：

```bash
./demo > out.dat
```

这样 `stdout` 就指向 `out.dat`，数据写进文件。`>` 会先清空 `out.dat` 的原有内容再写入；如果希望追加到文件末尾，用 `>>`：

```bash
./demo >> out.dat
```

标准错误的重定向符号是 `2>`，其中的 `2` 就是文件描述符编号：

```bash
./demo > out.dat 2> err.txt
```

上面这条命令把正常结果写进 `out.dat`，把报错信息写进 `err.txt`。

输入和输出重定向可以写在一条命令里，顺序无所谓：

```bash
./demo < in.dat > out.dat
./demo > out.dat < in.dat
```

还有一种情况，是把一个程序的 `stdout` 接到另一个程序的 `stdin`，用竖线 `|`：

```bash
./random | ./sum
```

这里 `random` 输出的数据，会变成 `sum` 的输入。

## fclose()

`fclose()` 关闭用 `fopen()` 打开的文件，原型在 `<cstdio>`：

```cpp
int fclose(FILE* stream);
```

它接受一个文件指针。成功关闭返回整数 `0`；失败（比如磁盘已满或有 I/O 错误）返回 `EOF`。

```cpp
if (fclose(fp) != 0) {
    cout << "Something wrong.\n";
}
```

不再使用的文件都应该关闭，否则资源不会释放。系统对同时打开的文件数量有上限，及时关闭可以避免达到这个上限。

## EOF

C 风格文件函数的设计是：读到文件结尾，就返回一个特殊值，程序收到它就明白已经到末尾了。

`<cstdio>` 为这个特殊值定义了宏 `EOF`（end of file 的缩写），值一般是 `-1`。之所以能安全地用 `-1`，是因为从文件里读出的字节值无论当作无符号数还是 ASCII 码，都不可能是负数，不会和文件本身的数据冲突。

**`EOF` 不是文件里存储的字符。** 字符串结尾存储了 `\0`，文件结尾并不存储 `EOF`，`EOF` 是文件函数读到末尾后返回的值。

这些函数的返回值类型是 `int` 而不是 `char`，原因是要能返回 `-1`。把返回值存进 `char` 变量再去和 `EOF` 比较是不可靠的——`char` 是否有符号由实现决定，很多平台上它装不下 `-1` 的正确表示，判断会出错。

## freopen()

`freopen()` 打开一个文件，并把它关联到某个已经存在的文件指针上，从而复用这个指针。原型在 `<cstdio>`：

```cpp
FILE* freopen(const char* filename, const char* mode, FILE* stream);
```

和 `fopen()` 相比就是多了第三个参数，即要复用的文件指针，前两个参数仍然是文件名和模式。

```cpp
freopen("output.txt", "w", stdout);
printf("hello");
```

上面把 `output.txt` 关联到 `stdout`，此后往 `stdout` 写的内容都进了这个文件。`printf()` 默认就输出到 `stdout`，所以运行结果是文件里出现了 `hello`。竞赛里更常用的写法是把它接到 `stdin`：

```cpp
freopen("in.txt", "r", stdin);
```

`freopen()` 的返回值就是它的第三个参数；打开失败则返回空指针。它会自动关闭原先已经打开的文件；如果第三个参数并没有指向已打开的文件，那它就等同于 `fopen()`。

注意顺序：先 `freopen`，再读写。下面的例子里两次 `scanf()` 的来源并不相同。

```cpp
int i, i2;

scanf("%d", &i);                  // 从键盘读

freopen("someints.txt", "r", stdin);
scanf("%d", &i2);                 // 从文件读
```

某些系统允许用 `freopen()` 改变已打开文件的模式，这时第一个参数传空指针：

```cpp
freopen(nullptr, "wb", stdout);   // 把 stdout 的打开模式从 w 改成 wb
```

## C++ 写法：ifstream、ofstream 与 stringstream

前面讲的都是 C 风格接口。C++ 还有一套基于 `<fstream>` 的写法，用**文件流对象**代替 `FILE*`，读写语法和 `cin`/`cout` 完全一样——`>>` 读、`<<` 写，类型自动识别，不用占位符，也不用取地址。它不需要重定向 `stdin`/`stdout`，可以同时打开多个文件。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ifstream fin("in.txt");     // 打开输入文件
    if (!fin) {                 // 和 fopen 判空是一个道理
        cout << "open failed\n";
        return 1;
    }

    int a, b;
    fin >> a >> b;              // 和 cin 用法一致
    cout << a + b << '\n';

    ofstream fout("out.txt");   // 打开输出文件（默认截断重写）
    fout << a + b << '\n';

    return 0;
}
```

`ifstream`/`ofstream` 都在 `<fstream>` 里，竞赛里被 `bits/stdc++.h` 一并包含。判断打开是否成功，直接写 `if (!fin)`（流对象能隐式转成 `bool`，打开失败为 `false`）。文件对象离开作用域时会自动关闭，不需要也不能像 `fclose` 那样手动关闭，这是 C++ 与 C 的差异之一。

还有一种常见组合：先用 `getline` 读一整行，再用 `stringstream` 把这一行当成输入流来解析。这适合“每行格式不固定、数量不定”的输入。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    while (getline(cin, line)) {        // 每次读一整行
        stringstream ss(line);          // 把这一行包成流
        int x, sum = 0;
        while (ss >> x) {               // 从行里逐个读整数
            sum += x;
        }
        cout << sum << '\n';
    }
    return 0;
}
```

`stringstream` 来自 `<sstream>`，用法和 `cin` 相同，只是数据源变成了一串内存里的字符，而不是键盘或文件。

两种接口的分工如下：**输入输出重定向首选 `freopen` + `cin`/`cout`**，改动最小，写成 `#ifdef LOCAL` 即可兼顾本地调试与提交；**需要同时读写多个文件或逐行读取后再解析时，使用 `ifstream`/`ofstream` + `stringstream`**。`fopen`、`fgetc` 等函数在竞赛中使用较少，阅读其他代码和系统编程资料时会遇到，以下逐个说明。

## fgetc()，getc()

`fgetc()` 和 `getc()` 从文件读一个字符，用法与 `getchar()` 类似，区别是 `getchar()` 只从 `stdin` 读，这两个函数可以从任意指定的文件读。原型在 `<cstdio>`：

```cpp
int fgetc(FILE* stream);
int getc(FILE* stream);
```

两者都只接受一个文件指针。区别在于 `getc()` 通常用宏实现，`fgetc()` 是函数实现，所以理论上 `getc()` 更快一点。注意它们的返回值类型是 `int` 而不是 `char`，读失败时要返回 `EOF`（一般是 `-1`），`char` 无法表示该值。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("hello.txt", "r");
    if (fp == nullptr) return 1;

    int c;                              // 必须是 int，才装得下 EOF
    while ((c = getc(fp)) != EOF) {
        putchar(c);
    }

    fclose(fp);
    return 0;
}
```

这个循环依次读出文件里每个字符，直到读到结尾返回 `EOF`，循环结束。

## fputc()，putc()

`fputc()` 和 `putc()` 向文件写入一个字符，用法与 `putchar()` 类似，区别是 `putchar()` 写向 `stdout`，这两个函数写向指定文件。原型在 `<cstdio>`：

```cpp
int fputc(int c, FILE* stream);
int putc(int c, FILE* stream);
```

两者都接受两个参数：待写入的字符和文件指针。`putc()` 通常用宏实现，`fputc()` 是函数实现，所以理论上 `putc()` 性能略好。写入成功返回写入的字符，失败返回 `EOF`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("out.txt", "w");
    if (fp == nullptr) return 1;

    const char* s = "hello";
    for (int i = 0; s[i] != '\0'; i++) {
        fputc(s[i], fp);
    }

    fclose(fp);
    return 0;
}
```

## fprintf()

`fprintf()` 向文件写入格式化字符串，用法与 `printf()` 类似，区别是 `printf()` 总是写向 `stdout`，而 `fprintf()` 写向指定文件，第一个参数必须是文件指针。原型在 `<cstdio>`：

```cpp
int fprintf(FILE* stream, const char* format, ...);
```

指定写入 `stdout` 时，它就等于 `printf()`：

```cpp
printf("Hello, world!\n");
fprintf(stdout, "Hello, world!\n");   // 效果相同
```

写向某个文件：

```cpp
fprintf(fp, "Sum: %d\n", sum);
```

也常用它把报错信息写进标准错误：

```cpp
fprintf(stderr, "Something number.\n");
```

## fscanf()

`fscanf()` 按给定模式从文件读内容，用法与 `scanf()` 类似，区别是 `scanf()` 总是从 `stdin` 读，而 `fscanf()` 从指定文件读，第一个参数必须是文件指针。原型在 `<cstdio>`：

```cpp
int fscanf(FILE* stream, const char* format, ...);
```

例子：

```cpp
fscanf(fp, "%d%d", &i, &j);   // 从 fp 读两个整数
```

用 `fscanf()` 的前提是知道文件的结构，它的占位符规则和 `scanf()` 完全一致。由于它会一直读到文件尾或出错（读取失败、匹配失败）才停，通常放在循环里：

```cpp
while (fscanf(fp, "%s", words) == 1) {
    puts(words);
}
```

上面这段依次读出文件里的每个“词”，一行打印一个，直到文件结束。

返回值是成功赋值的变量个数；如果在任何赋值发生之前就遇到输入失败，返回 `EOF`。循环条件用 `== 1` 而不是判断 `EOF`：读到末尾时返回值是 `EOF`，不等于 `1`，循环随即退出。

## fgets()

`fgets()` 从文件读取指定长度的字符串，名字里的 `f` 就是 file。原型在 `<cstdio>`：

```cpp
char* fgets(char* str, int size, FILE* stream);
```

第一个参数 `str` 是存放结果的字符数组，第二个参数 `size` 指定最多读多少，第三个是要读的文件。

读取时，读到 `size - 1` 个字符、或者遇到换行符、或者文件结束就停下，而在末尾补一个 `\0`，让它成为字符串。**注意 `fgets()` 会把换行符 `\n` 一起存进字符串**，这一点和 `scanf("%s")` 不同。

第三个参数传 `stdin` 时，它就读标准输入：

```cpp
fgets(str, sizeof(str), stdin);
```

读取成功时返回第一个参数，即指向该字符串的指针；失败（比如一开始就遇到文件结尾）返回空指针。

`fgets()` 常用来按行读文件：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("hello.txt", "r");
    if (fp == nullptr) return 1;

    char s[1024];               // 数组必须足够大，放得下一行
    int linecount = 0;

    while (fgets(s, sizeof s, fp) != nullptr) {
        printf("%d: %s", ++linecount, s);   // s 自带换行，不用再加 \n
    }

    fclose(fp);
    return 0;
}
```

每读一行就输出行号和内容，直到读不出为止。

用它循环读用户输入也一样：

```cpp
char words[10];

puts("Enter strings (q to quit):");

while (fgets(words, 10, stdin) != nullptr) {
    if (words[0] == 'q' && words[1] == '\n') {
        break;
    }
    puts(words);
}

puts("Done.");
```

如果用户输入的字符串超过 9 个字符，`fgets()` 会分多次把它读完；输入 `q` 加回车才退出循环。

## fputs()

`fputs()` 向文件写入字符串，和 `puts()` 只有一个区别：它不在末尾添加换行符。这正是为了和 `fgets()` 配对——既然 `fgets()` 把换行符也读进来了，`fputs()` 就不必再加。原型在 `<cstdio>`：

```cpp
int fputs(const char* str, FILE* stream);
```

第一个参数是字符串，第二个是目标文件。第二个参数传 `stdout` 时，就是向屏幕输出。

```cpp
char words[14];

puts("Enter a string, please.");
fgets(words, 14, stdin);

puts("This is your string:");
fputs(words, stdout);
```

写入成功返回一个非负整数，失败返回 `EOF`。

## fwrite()

`fwrite()` 一次性写入较大的数据块，主要用途是把整个数组一次性写进文件，尤其适合二进制数据。原型在 `<cstdio>`：

```cpp
size_t fwrite(const void* ptr, size_t size, size_t nmemb, FILE* stream);
```

四个参数：

- `ptr`：数据起始地址（数组指针）。
- `size`：每个成员占多少字节。
- `nmemb`：成员的个数。
- `stream`：目标文件指针。

第一个参数类型是 `const void*`（无类型指针），传任何类型的指针都会被自动转换。由于函数本身不知道成员类型，需要额外给出每个成员的大小和成员个数。

返回值是**成功写入的成员个数**（不是字节数）。正常情况下等于 `nmemb`，写入出错只写进去一部分时，会比 `nmemb` 小。

把整个数组 `arr` 写进文件：

```cpp
fwrite(
    arr,
    sizeof(arr[0]),
    sizeof(arr) / sizeof(arr[0]),
    fp
);
```

`sizeof(arr[0])` 是每个成员的字节数，`sizeof(arr) / sizeof(arr[0])` 是成员个数。

写一个 256 字节的字符数组：

```cpp
char buffer[256];
fwrite(buffer, 1, 256, fp);
```

这里每个成员 1 字节、共 256 个。由于 `fwrite()` 做的连续内存拷贝，写成 `fwrite(buffer, 256, 1, fp)` 效果一样。它也不要求写整个数组，只写一部分完全可以。

任何类型的数据都能看成“由若干字节组成的数组”，所以 `fwrite()` 能写的不只是数组，结构体也行：

```cpp
fwrite(&s, sizeof(s), 1, fp);
```

但要注意，如果结构体里有指针成员，直接存下来往往没有意义——还原的时候，指针原来指向的数据不保证还在。

`fwrite()` 和后面的 `fread()` 适合二进制数据，因为它们不对数据做任何解读。二进制数据里可能含空字符 `\0`，而 `\0` 是字符串的结束标记，所以读写二进制文件不能用文本函数（比如 `fprintf()` 之类）。

下面写一个二进制文件：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    unsigned char bytes[] = {5, 37, 0, 88, 255, 12};

    FILE* fp = fopen("output.bin", "wb");   // 二进制写入要用 "wb"
    if (fp == nullptr) return 1;

    fwrite(bytes, sizeof(char), sizeof bytes, fp);
    fclose(fp);
    return 0;
}
```

`fwrite()` 把数据当成单字节数组，所以第二个参数是 `sizeof(char)`，第三个参数是数组总字节数 `sizeof(bytes)`。生成的 `output.bin` 用十六进制编辑器打开，内容如下。

```text
05 25 00 58 ff 0c
```

`fwrite()` 还能连续写一个文件：

```cpp
struct clientData myClient = {1, 'foo bar'};

for (int i = 1; i <= 100; i++) {
    fwrite(&myClient, sizeof(struct clientData), 1, cfPtr);
}
```

## fread()

`fread()` 一次性从文件读取较大的数据块，主要用途是把文件内容读进数组，适合二进制数据。原型在 `<cstdio>`：

```cpp
size_t fread(void* ptr, size_t size, size_t nmemb, FILE* stream);
```

四个参数与 `fwrite()` 相同，含义对调：

- `ptr`：接收数据的内存地址（数组地址）。
- `size`：每个成员占多少字节。
- `nmemb`：成员的个数。
- `stream`：文件指针。

把文件内容读进数组 `arr`：

```cpp
fread(
    arr,
    sizeof(arr[0]),
    sizeof(arr) / sizeof(arr[0]),
    fp
);
```

第二个参数和第三个参数的乘积就是它要读的字节数，函数会把这么多内容从文件搬到 `ptr` 指向的内存里。

读一个 10 个成员的 `double` 数组：

```cpp
double earnings[10];
fread(earnings, sizeof(double), 10, fp);   // 读 sizeof(double) * 10 字节
```

返回值是成功读到的**成员个数**。正常时等于 `nmemb`；读到文件尾或出错时，会小于 `nmemb`。**需要检查返回值**，它是判断“读了多少、是不是读完了”的依据。

`fread()` 和 `fwrite()` 常配对使用：程序结束前用 `fwrite()` 把数据存进文件，下次运行再用 `fread()` 读回内存。

下面是读取前面生成的 `output.bin` 的例子：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    FILE* fp = fopen("output.bin", "rb");   // 二进制读取要用 "rb"
    if (fp == nullptr) return 1;

    unsigned char c;
    while (fread(&c, sizeof(char), 1, fp) > 0) {
        printf("%d\n", c);
    }

    fclose(fp);
    return 0;
}
```

运行结果：

```text
5
37
0
88
255
12
```

## feof()

`feof()` 判断文件的内部指示器是否指向文件结尾。原型在 `<cstdio>`：

```cpp
int feof(FILE* stream);
```

接受一个文件指针。已经到结尾返回非零值（真），否则返回 `0`（假）。

`fgetc()` 这类函数返回 `EOF` 时有两种可能：真的读到了文件结尾，或者发生了读取错误。`feof()` 就是用来区分这两种情况的——前者为真，后者为假（那就要用 `ferror()` 去查，见后文）。

**`feof()` 存在一种常见误用。** 下面的代码是错误的：

```cpp
// 错误写法
while (!feof(cfPtr)) {
    fscanf(cfPtr, "%d%s", &num, name);
    printf("%d %s\n", num, name);
}
```

问题在于 `feof()` 只有在**某次读操作已经失败之后**才变为真。读到文件的最后一条记录时 `feof()` 仍为假，循环会再执行一次，`fscanf()` 读取失败，`num`、`name` 保留上一次的值，最后一条记录会被打印两次。

正确做法是**把文件结尾的判断放在读操作之后**，直接看读函数的返回值：

```cpp
while (fscanf(cfPtr, "%d%s", &num, name) == 2) {
    printf("%d %s\n", num, name);
}
```

**循环条件应使用读取函数的返回值，而不是用 `feof()` 预测下一次读取是否成功。**

`feof()` 为真后，可以通过 `fseek()`、`rewind()`、`fsetpos()` 移动文件内部指示器，从而清除这个状态。

## fseek()

每个文件指针内部都有一个指示器（内部指针），记录当前文件的读写位置（file position），也就是下一次读写从哪里开始。所有文件读写函数（`getc()`、`fgets()`、`fscanf()`、`fread()` 等）都从这个位置开始顺序进行。

要改变这个位置，用 `fseek()`。原型在 `<cstdio>`：

```cpp
int fseek(FILE* stream, long offset, int whence);
```

三个参数：

- `stream`：文件指针。
- `offset`：相对基准的偏移字节数，类型为 `long`。正值往文件末尾方向移，负值往开头方向移，`0` 表示不动。
- `whence`：基准位置，取值是 `<cstdio>` 里定义的三个宏——`SEEK_SET`（文件开头）、`SEEK_CUR`（当前位置）、`SEEK_END`（文件末尾）。

几个例子：

```cpp
fseek(fp, 0L, SEEK_SET);    // 定位到文件开头
fseek(fp, 0L, SEEK_END);    // 定位到文件末尾
fseek(fp, 2L, SEEK_CUR);    // 从当前位置往后移 2 字节
fseek(fp, 10L, SEEK_SET);   // 定位到文件第 10 个字节
fseek(fp, -10L, SEEK_END);  // 定位到文件倒数第 10 个字节
```

第二个参数是 `long`，所以字面量习惯写上后缀 `L`，明确它是 `long` 类型。

利用它可以逆序输出文件的所有字节：

```cpp
for (long count = 1L; count <= size; count++) {
    fseek(fp, -count, SEEK_END);
    ch = getc(fp);
}
```

`fseek()` 适用于二进制文件，不适用于文本文件定位：文本文件涉及编码，某个位置对应的准确字节偏移难以确定。

正常时返回 `0`；出错（比如移动距离超出文件范围）返回非零值。

## ftell()

`ftell()` 返回文件内部指示器的当前位置。原型在 `<cstdio>`：

```cpp
long ftell(FILE* stream);
```

接受一个文件指针，返回一个 `long`，表示从文件开头到当前位置的字节数，开头是 `0`。出错返回 `-1L`。

它常和 `fseek()` 配合：先记下位置，做一串操作后再回到原处。

```cpp
long file_pos = ftell(fp);

// ... 一系列文件操作之后
fseek(fp, file_pos, SEEK_SET);
```

也可以先用它求文件大小——先定位到末尾，再读位置：

```cpp
fseek(fp, 0L, SEEK_END);
long size = ftell(fp);
```

## rewind()

`rewind()` 把文件内部指示器送回文件开头。原型在 `<cstdio>`：

```cpp
void rewind(FILE* stream);
```

它接受一个文件指针，没有返回值。

`rewind(fp)` 基本等价于 `fseek(fp, 0L, SEEK_SET)`，区别有两点：`rewind()` 不返回任何值，而且会顺带清除该文件的错误指示器。

## fgetpos()，fsetpos()

`fseek()` 和 `ftell()` 有一个潜在限制：它们把文件位置存在 `long` 里，因此文件大小受 `long` 能表示的范围约束。在 32 位平台上 `long` 是 4 字节，最大约 4GB。存储设备越来越大，这个上限就不够用了。为此 C 语言又加了两个定位函数 `fgetpos()` 和 `fsetpos()`，用来处理大文件。原型在 `<cstdio>`：

```cpp
int fgetpos(FILE* stream, fpos_t* pos);
int fsetpos(FILE* stream, const fpos_t* pos);
```

`fgetpos()` 把文件内部指示器的当前位置存进 `pos` 指向的变量；`fsetpos()` 把指示器移动到 `pos` 指定的位置。

用来记录位置的变量类型是 `fpos_t`（file position type，文件定位类型）。它不一定是整数，也可能是结构体，所以不能像 `long` 那样直接做加减——`fsetpos()` 用的 `pos` 必须是由 `fgetpos()` 取得的那个值，不能自己拼。

```cpp
fpos_t file_pos;
fgetpos(fp, &file_pos);

// ... 一系列文件操作之后
fsetpos(fp, &file_pos);
```

成功时两个函数都返回 `0`，否则返回非零值。

## ferror()，clearerr()

文件操作函数执行失败时，会在文件指针里记下错误状态，之后再查这个错误指示器就知道前面出过问题。

`ferror()` 返回错误指示器的状态，用来判断前面的文件操作是否成功。原型在 `<cstdio>`：

```cpp
int ferror(FILE* stream);
```

接受一个文件指针。前面的操作出错返回非零整数（真），否则返回 `0`。

`clearerr()` 重置出错指示器，原型在 `<cstdio>`：

```cpp
void clearerr(FILE* stream);
```

接受一个文件指针，没有返回值。

```cpp
FILE* fp = fopen("file.txt", "w");
int c = fgetc(fp);          // 向"写模式"打开的文件读，必然失败

if (ferror(fp)) {
    cout << "读取文件 file.txt 时发生错误\n";
}

clearerr(fp);
```

上面用 `fgetc()` 从一个写模式打开的文件读取，读失败返回 `EOF`；这时 `ferror()` 为真，说明是读取错误而不是到了结尾。处理完用 `clearerr()` 清掉状态。

注意错误指示器和结尾指示器一旦被置位，就会一直保持，直到被显式清除。所以当一个读函数返回 `EOF` 时，要分清到底是哪一种，就得同时看这两个指示器：

```cpp
if (fscanf(fp, "%d", &n) != 1) {
    if (ferror(fp)) {
        cout << "io error\n";
    }
    if (feof(fp)) {
        cout << "end of file\n";
    }

    clearerr(fp);           // 同时清除错误指示器和结尾指示器

    fclose(fp);
}
```

正常执行时 `ferror()` 和 `feof()` 都返回 `0`；不正常时，用它们分别判断问题出在哪。

## remove()

`remove()` 删除指定文件，原型在 `<cstdio>`：

```cpp
int remove(const char* filename);
```

接受文件名。删除成功返回 `0`，否则返回非零值。

```cpp
remove("foo.txt");
```

注意，文件必须处于关闭状态才能删除。如果是用 `fopen()` 打开的，得先 `fclose()`。

## rename()

`rename()` 给文件改名，也用来移动文件。原型在 `<cstdio>`：

```cpp
int rename(const char* old_filename, const char* new_filename);
```

第一个参数是现在的文件名，第二个是新的文件名。成功返回 `0`，否则返回非零值。

```cpp
rename("foo.txt", "bar.txt");
```

改名后的文件不能和现有文件重名。另外，要改名的文件必须先关闭，对已经打开的文件改名会失败。

由于新名字可以带路径，`rename()` 也就等于移动文件：

```cpp
rename("/tmp/evidence.txt", "/home/beej/nothing.txt");
```
