---
title: "预处理器（Preprocessor）"
description: "预处理器在编译之前按 `#` 开头的指令改写源码。本章讲 `#include`、`#define` 与宏、条件编译等指令，以及竞赛里常用的头文件、调试开关和 `#define int long long` 这类手法。"
---
# 预处理器（Preprocessor）

## 简介

C++ 的编译器在真正编译代码之前，会先跑一遍**预处理器（preprocessor）**，处理源码里所有以 `#` 开头的**预处理指令**。

预处理器干两件事：先把源码整理成"干净"的形式——删掉注释、把续行的反斜杠接上、把 `#include` 的文件内容铺开；然后执行各种指令，做**纯文本替换**。

理解这一点很重要：预处理发生在编译之前，是文本层面的操作，不涉及类型，也不懂语法。它只是在编译器看到代码之前，先把某些字换掉、把某些行删掉。后面讲到的"宏替换出意外"，根源都在这里。

书写规则不复杂：指令都从 `#` 开始，放在行首，前面可以有空格或制表符；`#` 和指令名之间一般不写空格（兼容老编译器更保险）；一条指令只占一行，想续行就在行尾写反斜杠 `\`；指令末尾**不写分号**。

竞赛代码里天天用到的其实只有三个：`#include <bits/stdc++.h>`、条件编译（本地调试开关），以及各种 `#define`。其余指令认得、会读就够了。

## #define

`#define` 是最常见的预处理指令，用来做文本替换。参数分两部分：前面是要被替换的词，后面是替换成的内容。每条规则称为一个**宏（macro）**。

```cpp
#define MAX 100
```

上面把源码里所有的 `MAX` 替换成 `100`。宏名必须遵守标识符命名规则：只能用字母、数字、下划线，且首字符不能是数字，中间不能有空格。

替换是**原样替换**，写什么就换什么：

```cpp
#define HELLO "Hello, world"

// 相当于 cout << "Hello, world" << '\n';
cout << HELLO << '\n';
```

`#define` 从出现处起、到文件末尾都有效，习惯上都放在文件开头。它还能引用别的宏，层层替换：

```cpp
#define TWO 2
#define FOUR TWO*TWO        // FOUR 会变成 2*2
```

有两条边界要记住：宏出现在字符串里、或者作为更长标识符的一部分时，**不会**被替换。

```cpp
#define TWO 2

cout << "TWO\n";        // 输出 TWO，双引号内部不替换
int TWOs = 22;          // TWOs 是一个独立标识符，不会变成 2s
```

同名宏可以重复定义，但两次定义必须完全一样，不一样就报错。

```cpp
#define FOO hello
#define FOO hello           // 没问题，定义相同

#define BAR hello
#define BAR world           // 报错，定义冲突
```

指令太长，可以用反斜杠拆成多行：

```cpp
#define OW "C programming language is invented \
in 1970s."
```

### 用宏定义常量

宏最朴素的用途是给常量起名字，但竞赛里不该这么干。宏是纯文本，没有类型、没有作用域，出了问题时编译器报的错误常常驴唇不对马嘴。C++ 里定义常量的正道是 `const`（或 `constexpr`）。

```cpp
#define MAXN 100005        // 不推荐

const int N = 100005;      // 推荐：有类型、有作用域
```

`const` 变量参与类型检查，能放进命名空间和函数里，调试时也能看到值；`MAXN` 只是一个文本，调试器里根本找不到它。唯一的例外是数组长度这类必须"编译期常量"的场合——C++11 之后 `const int N = 100005;` 同样满足，所以还是没有必要用宏。

要在多份代码之间共享一个常量，把它声明成 `const` 全局变量即可，不必依赖"宏会一路生效到文件末尾"这种特性。

### `#define int long long`

竞赛圈流行一个歪招：整个文件开头写一句

```cpp
#define int long long
```

此后所有的 `int` 都被替换成 `long long`，目标是一劳永逸地躲开溢出。它确实管用，但坑不少。

```cpp
#include <bits/stdc++.h>
using namespace std;

#define int long long        // 从此所有 int 都是 long long

signed main() {              // 注意：main 前面的 int 也被换掉了
    int n = 100000;
    cout << n * n << '\n';   // 10^10，用 32 位 int 早就溢出了
    return 0;
}
```

坑主要集中在这几处：

- **`main` 的返回类型被换成了 `long long`**，标准不认，所以必须写 `signed main()` 把 `signed` 顶上去，或者写 `int32_t main()`。这是最常见的"编译不过"原因。
- **和 `printf` 的占位符打架**。变量已经是 64 位，`%d` 对应的却是 32 位整数，类型不匹配是未定义行为，得改用 `%lld`。既然都用了这个宏，输出整数干脆别用 `printf`。
- **内存和常数都翻倍**。数组、`vector`、结构体的空间全部乘以二，有些题会从"勉强过得去"变成 MLE（内存超限）；大整数运算也比 32 位慢。
- **标准库内部也会被波及**。如果 `bits/stdc++.h` 在宏之后才包含，头文件里的代码同样会被替换，某些重载会出现意想不到的解析结果。所以宏要写在 `#include` 之后，而竞赛模板通常又习惯把头文件放在最前面。
- **`size_t` 之类不受影响**，仍然是 64 位无符号数，和有符号整数混用时的警告照旧。

结论是：能用，但要清楚代价。更稳的做法是显式区分——需要 64 位的地方就写 `long long`，或者 `using ll = long long;` 起个短名，哪一处要 64 位就写 `ll`。这样编译器能帮你检查类型，读代码的人也不会被一个宏骗到。

顺便说一句，竞赛模板里另一类常见宏是用短名字代替长类型或常量：

```cpp
using ll = long long;      // 比 typedef long long ll; 好读
const int INF = 0x3f3f3f3f;
```

`INF` 用 `const int` 而不是 `#define INF 0x3f3f3f3f`，理由和上面一样。

## 带参数的宏

### 基本用法

宏名后面可以跟圆括号，接受参数：

```cpp
#define SQUARE(X) X*X
```

注意，宏名和左括号之间**不能有空格**，否则它会被当成一个无参数宏。

用起来像函数，但它不是函数，是完全的原样替换：

```cpp
z = SQUARE(2);          // 替换成 z = 2*2;
```

正因为是原样替换，参数里的表达式会直接嵌进去，优先级问题就来了：

```cpp
#define SQUARE(X) X*X

cout << SQUARE(3 + 4) << '\n';      // 输出 19，不是 49
```

原因很直白：`SQUARE(3 + 4)` 被换成 `3 + 4*3 + 4`，按优先级算是 `3+12+4=19`。要当函数用的东西，就得像函数一样把参数和整体都括起来：

```cpp
#define SQUARE(X) ((X) * (X))
```

括号加到位，绝大多数意外都能避免：

```cpp
#define MAX(x, y) ((x) > (y) ? (x) : (y))
#define IS_EVEN(n) ((n) % 2 == 0)
```

带参数的宏也可以没有参数，这时括号只是为了"看起来像函数"：

```cpp
#define getchar() getc(stdin)
```

宏太长可以用反斜杠折成多行。写多语句宏时，习惯用一对大括号包出一个块作用域，避免内部变量污染外面：

```cpp
#define PRINT_NUMS_TO_PRODUCT(a, b) { \
    int product = (a) * (b); \
    for (int i = 0; i < product; i++) { \
        cout << i << '\n'; \
    } \
}
```

宏也能互相嵌套：

```cpp
#define QUADP(a, b, c) ((-(b) + sqrt((b) * (b) - 4 * (a) * (c))) / (2 * (a)))
#define QUADM(a, b, c) ((-(b) - sqrt((b) * (b) - 4 * (a) * (c))) / (2 * (a)))
#define QUAD(a, b, c) QUADP(a, b, c), QUADM(a, b, c)
```

这是一元二次方程求根公式：`QUAD` 先展开成另外两个宏，再各自展开成一个根。`sqrt` 来自 `<cmath>`。

那什么时候用宏、什么时候用函数？**能用函数就用函数。** C++ 的 `inline` 函数、`constexpr` 函数、模板都能拿到"就地展开、没有调用开销"的效果，同时还保留类型检查和调试信息。宏剩下的"优势"只有两条：不涉及类型（也因此不受类型检查），以及文本替换不产生函数调用。前一条在竞赛里是缺点不是优点，后一条交给 `inline` 就行。

真正要向宏学的，是读懂别人的代码——大量历史代码和竞赛模板里都是宏。自己写新代码，函数优先。

### `#` 运算符、`##` 运算符

`#` 把参数变成字符串：

```cpp
#define STR(x) #x

cout << STR(3.14159) << '\n';       // 输出 3.14159
```

不加 `#` 时 `3.14159` 是一个浮点数，加了 `#` 就变成字符串 `"3.14159"`。它还能和相邻的字符串拼接：

```cpp
#define XNAME(n) "x"#n

cout << XNAME(4) << '\n';           // 输出 x4
```

`##` 把两段文本粘成一个标识符：

```cpp
#define MK_ID(n) i##n

int MK_ID(1), MK_ID(2), MK_ID(3);
// 展开成
int i1, i2, i3;
```

`##` 的主要用途就是批量生成标识符。竞赛里偶尔有人用它写"生成若干同族变量"的模板，可读性差、出错也难查，不建议在正式代码里用。

### 不定参数的宏

参数可以有"剩余若干个"，用 `...` 表示，替换文本里用 `__VA_ARGS__` 取到：

```cpp
#define X(a, b, ...) (10 * (a) + 20 * (b)), __VA_ARGS__

X(5, 4, 3.14, "Hi!", 12)
// 展开成
(10 * (5) + 20 * (4)), 3.14, "Hi!", 12
```

`...` 只能放在参数列表末尾，放中间是语法错误：

```cpp
// 报错
#define WRONG(X, ..., Y) #X #__VA_ARGS__ #Y
```

`__VA_ARGS__` 前面加 `#` 同样能变成字符串：

```cpp
#define X(...) #__VA_ARGS__

cout << X(1, 2, 3) << '\n';         // 输出 1, 2, 3
```

不定参数宏在"包一层调试输出"时有点用，但 C++ 有可变参数模板和 `ostream`，竞赛里基本不需要它。

## #undef

`#undef` 取消一个已经定义的宏：

```cpp
#define LIMIT 400
#undef LIMIT
```

取消之后 `LIMIT` 就只是一个普通标识符，可以重新定义。想重新定义一个宏、又不确定之前定义过没有时，先 `#undef` 一下最省事——同名宏定义不一致会报错，而 `#undef` 一个不存在的宏不会报错。

编译时也能取消，GCC 的 `-U` 参数等价于源码里的 `#undef`：

```bash
g++ -ULIMIT foo.cpp
```

## #include

`#include` 在编译前把另一个文件的内容整段搬进来。有两种写法：

```cpp
#include <foo.h>        // 尖括号：系统 / 标准库的文件
#include "foo.h"        // 双引号：自己项目里的文件
```

尖括号形式由编译器到系统安装目录里找；双引号形式优先在源文件所在目录和项目目录里找。要找的文件在别处，可以写路径，也可以用 GCC 的 `-I` 参数加搜索目录：

```bash
g++ -Iinclude/ -o code code.cpp
```

上面命令让编译器到当前目录的 `include/` 子目录里去找双引号形式的头文件。

从《C++ 简介》开始，本书一直在用的就是 `#include`。竞赛代码的开头固定是：

```cpp
#include <bits/stdc++.h>
```

`bits/stdc++.h` 是 GCC 专有的"万能头文件"，它内部其实就是一长串 `#include`，把标准库几乎全部内容都引了进来。竞赛里用它省事；代价是编译变慢（每个文件都要把所有头文件过一遍），而且它不是标准的一部分，换成 MSVC 就没有这个文件。工程代码里应当按需包含，比如只要输入输出就写 `#include <iostream>`。

多个 `#include` 的先后顺序一般无关紧要，同一个头文件被包含多次也是合法的——标准库头文件自带防护，自定义头文件则要靠下面要讲的 `#ifndef`。头文件与多文件编译的关系见《多文件编译》一章。

## #if...#endif

条件编译：条件成立，中间的行才参与编译；不成立，整段被丢掉。

```cpp
#if 0
    const double pi = 3.1415;       // 不会编译
#endif
```

`#if` 后面跟一个整数常量表达式，非 `0` 为真。`#if 0` 因此成了"注释大法"——比 `/* */` 好在可以嵌套，也不怕代码里本来就有注释：

```cpp
#if 0
    // 一堆暂时不用的调试代码
#endif
```

可以带 `#else` 和 `#elif`：

```cpp
#define FOO 1

#if FOO
    cout << "defined\n";
#else
    cout << "not defined\n";
#endif
```

```cpp
#if HAPPY_FACTOR == 0
    cout << "I'm not happy!\n";
#elif HAPPY_FACTOR == 1
    cout << "I'm just regular\n";
#else
    cout << "I'm extra happy!\n";
#endif
```

`#elif` 要写在 `#else` 之前。另外，**没定义过的宏在 `#if` 里等同于 `0`**：`#if UNDEFINED` 为假，`#if !UNDEFINED` 为真。

### 本地调试开关

`#if` 在竞赛里最大的用处，是做一个"只在本机生效"的调试开关。典型写法：

```cpp
#include <bits/stdc++.h>
using namespace std;

#define DEBUG               // 本机调试时打开；提交前删掉这一行

int main() {
#ifdef DEBUG
    freopen("in.txt", "r", stdin);      // 本地从文件读输入，省得每次手敲
#endif

    int n;
    cin >> n;
    cout << n << '\n';

#ifdef DEBUG
    cerr << "n = " << n << '\n';        // 调试信息写到 stderr
#endif
    return 0;
}
```

要在命令行临时打开开关，用 GCC 的 `-D` 参数指定宏，等价于在源码里写 `#define DEBUG`：

```bash
g++ -std=c++17 -O2 -DDEBUG -o sol sol.cpp
```

同一份代码，本地这样编译就有文件重定向和调试输出，交到评测机上不定义 `DEBUG`，就是干净的标准输入输出。

这里顺带交代一个细节：调试信息用 `cerr`（连到标准错误）而不是 `cout`。判题只看标准输出，写进 `cerr` 的内容不影响答案，即使忘了关也不会 WA。

## #ifdef...#endif

`#ifdef` 判断某个宏**是否定义过**，不看它的值：

```cpp
#define DEBUG

#ifdef DEBUG
    cout << "debug on\n";
#endif
```

注意 `#ifdef` 只问"有没有"，`#if` 问的是"值是多少"。`#define DEBUG 0` 用 `#if DEBUG` 判断为假，用 `#ifdef DEBUG` 判断为真，写调试开关时别把两者搞混。

`#ifdef` 也能配 `#else`，用来做条件加载：

```cpp
#ifdef MAVIS
    #include "foo.h"
    #define STABLES 1
#else
    #include "bar.h"
    #define STABLES 2
#endif
```

## defined 运算符

`#ifdef FOO` 等同于 `#if defined FOO`：

```cpp
#ifdef FOO
// 等同于
#if defined FOO
```

`defined` 是预处理阶段的运算符：参数是定义过的宏就返回 `1`，否则返回 `0`。它能出现在更复杂的表达式里，这是 `#ifdef` 做不到的：

```cpp
#if defined FOO && !defined BAR
    int x = 2;
#elif defined BAR
    int x = 3;
#endif
```

它也可以用来检查 C++ 标准版本——`__cplusplus` 是预定义宏，表示编译器使用的 C++ 标准：

```cpp
#if defined(__cplusplus) && __cplusplus >= 201703L
    // 这里是 C++17 及以上才会编译的代码
#endif
```

本地调试也能用这种写法，不必手动增删 `#define`：

```cpp
#if defined(LOCAL) && LOCAL
    freopen("in.txt", "r", stdin);
#endif
```

## #ifndef...#endif

`#ifndef` 和 `#ifdef` 相反：宏**没有**定义过时才编译中间的内容。

```cpp
#ifndef DEBUG
    cout << "release build\n";
#endif
```

它最经典的用途是**头文件保护（include guard）**，防止同一个头文件被重复包含：

```cpp
#ifndef MYHEADER_H
    #define MYHEADER_H
    // 头文件的真正内容
#endif
```

逻辑是：第一次包含时 `MYHEADER_H` 还没定义，于是编译内部内容，并顺手定义 `MYHEADER_H`；第二次再包含时宏已经存在，`#ifndef` 不成立，整段跳过。宏名习惯用文件名大写加下划线。

`#ifndef FOO` 等同于 `#if !defined FOO`。现代写法的替代品是每个头文件开头写一句 `#pragma once`，但 `#ifndef` 是标准规定的，可移植性最好。

## 预定义宏

编译器预先定义了一批宏，可以直接用。常用的有：

- `__DATE__`：编译日期，形如 `Mar 29 2021`。
- `__TIME__`：编译时间，形如 `19:19:37`。
- `__FILE__`：当前文件名。
- `__LINE__`：当前行号。
- `__func__`：当前所在函数名，只能在函数里用。
- `__cplusplus`：C++ 标准版本号，C++17 是 `201703L`，C++20 是 `202002L`。
- `__STDC_HOSTED__`：是否具备完整标准库，`1` 表示有，`0` 表示没有（嵌入式环境常见）。
- `__STDC_VERSION__`：C 标准版本号，只在把代码当 C 编译时才有意义。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "file: " << __FILE__ << '\n';
    cout << "line: " << __LINE__ << '\n';
    cout << "compiled: " << __DATE__ << ' ' << __TIME__ << '\n';
    cout << "C++ version: " << __cplusplus << '\n';
    return 0;
}
```

竞赛里最有用的一个组合是 `__LINE__`：写调试输出时带上行号，一眼就能定位是哪儿打出来的。也可以把它包成"只在本地生效的日志"宏，思路和上面的 `#ifdef DEBUG` 一样。

## #line

`#line` 用来改写后续的 `__LINE__`（行号）和 `__FILE__`（文件名）：

```cpp
#line 300
// 从这里开始，下一行的 __LINE__ 是 300，再往下递增

#line 300 "newfilename"
// 行号重置为 300，文件名重置为 newfilename
```

它主要服务于"代码生成器"：生成的代码里插一句 `#line`，编译器就能把错误报到原始文件的行号上。日常和竞赛代码都用不到。

## #error

`#error` 让预处理器直接报错、中止编译：

```cpp
#if __cplusplus < 201703L
    #error 需要 C++17 或更高标准
#endif
```

编译器会把这条消息原样打印出来。它的价值在于**把错误提前到编译期**：条件编译挑错了分支、编译平台不符合要求时，立刻停下来，比运行到一半崩掉好查得多。

```cpp
#if defined WIN32
    // ...
#elif defined MAC_OS
    // ...
#elif defined LINUX
    // ...
#else
    #error 不支持的操作系统
#endif
```

## #pragma

`#pragma` 用来给编译器下一些标准之外的特殊指示，内容因编译器而异。最常见的是：

```cpp
#pragma once          // 头文件只包含一次，替代 #ifndef 保护
```

GCC 还有一组 `#pragma GCC optimize`，可以指定优化选项：

```cpp
#pragma GCC optimize("O3")
#pragma GCC optimize("unroll-loops")
```

它能让某些常数较大的题在评测机上跑得快一点，但有三个限制要清楚：这是 GCC 专有的，其他编译器（如 Clang、MSVC）会忽略甚至报错；评测机可能禁用这类指示；它和命令行上的 `-O2` 叠加，效果不保证。**更稳的做法是编译时加 `-O2`**，把 `#pragma GCC optimize` 当成"实在过不了时再试"的手段。
