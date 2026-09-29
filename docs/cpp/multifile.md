---
title: "多文件项目"
description: "一个项目可以拆成多个源码文件，分别编译后链接成一个可执行文件。竞赛通常只写单个源文件，但阅读多文件项目时需要理解拆分与链接的机制。"
---
# 多文件项目

## 简介

竞赛通常只需要写一个源文件。

在线评测的提交框只收一份代码，评测机也只编译提交的那一个文件。把全部逻辑写在 `main.cpp` 里不会引入跨文件问题，也不会因为漏交一个文件而链接失败。多文件是工程开发的常规做法：程序规模增大后，把所有代码堆在一个文件里难以维护。学习这套机制用于读懂他人的项目结构，以及在需要时拆分自己的代码。

多文件项目的做法是：把代码按职责分到几个源码文件里，编译时一起交给编译器，链接成一个可执行文件。假定项目有 `foo.cpp` 和 `bar.cpp` 两个文件，其中 `foo.cpp` 是主文件，含 `main()` 函数；`bar.cpp` 是库文件，提供函数。

```cpp
// File foo.cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << add(2, 3) << '\n';   // 期望输出 5
    return 0;
}
```

`add()` 定义在 `bar.cpp` 里：

```cpp
// File bar.cpp

int add(int x, int y) {
    return x + y;
}
```

把两个文件一起编译：

```bash
g++ -o foo foo.cpp bar.cpp
```

只给 `foo.cpp` 是不行的：`add` 找不到定义，链接阶段会报 `undefined reference to 'add(int, int)'`。

源文件较多时，逐个列出文件名容易遗漏。使用通配符可以一次性带上当前目录的 `.cpp`：

```bash
g++ -std=c++17 -O2 -o foo *.cpp
```

`*.cpp` 由 Shell 展开成当前目录下所有 `.cpp` 文件名。这条命令可以完成编译和链接，但 `foo.cpp` 单独编译时会直接报错：编译器没见过 `add()` 这个名字。C++ 要求函数先声明后使用，而 `foo.cpp` 里既没有它的原型，也没有它的定义。

在 `foo.cpp` 顶部补上函数原型：

```cpp
// File foo.cpp
#include <bits/stdc++.h>
using namespace std;

int add(int, int);   // 函数原型，参数名可以省略

int main() {
    cout << add(2, 3) << '\n';
    return 0;
}
```

原型只交代返回类型和参数类型，告诉编译器该怎么调用 `add()`；具体实现在链接阶段去找。

多个文件都要用 `add()` 时，每个文件都得抄一份原型；参数一改，还要逐个文件修改。惯常的做法是把库函数的原型集中放进一个头文件 `bar.h`：

```cpp
// File bar.h

int add(int, int);
```

哪个文件要用，就 `#include` 它：

```cpp
// File foo.cpp
#include <bits/stdc++.h>
#include "bar.h"
using namespace std;

int main() {
    cout << add(2, 3) << '\n';
    return 0;
}
```

`#include "bar.h"` 用的是双引号而不是尖括号，含义是“这个头文件由用户提供”：双引号形式先在当前目录找，再去系统目录找；尖括号形式只找系统目录。所以自己写的头文件一律用双引号。不写路径就表示与当前源文件在同一目录。

在 `bar.cpp` 里也包含 `bar.h`，编译器会顺便核对原型和定义是否一致，参数写错会在编译时报错：

```cpp
// File bar.cpp
#include "bar.h"

int add(int a, int b) {
    return a + b;
}
```

再编译一次，不再报错：

```bash
g++ -o foo foo.cpp bar.cpp
```

头文件的工作方式、`#include` 展开的细节在《预处理器》一章里讲。`#include` 做的事是：把文件内容原样插到 `#include` 所在的位置。

## 重复加载

头文件里可以再包含别的头文件，因此会出现同一个头文件被包含两次的情况。比如 `a.h` 和 `b.h` 都包含了 `c.h`，而 `foo.cpp` 同时包含了 `a.h` 和 `b.h`——`c.h` 的内容就被插了两遍。

重复声明一个函数原型没有问题，但**重复定义**会出错：C++ 里一个 `struct`、一个 `class`、一个全局变量只能定义一次。因此头文件必须防止重复包含。

标准做法是“包含卫士”（include guard）：给头文件配一个专属的宏，第一次包含时定义它，第二次包含时发现宏已存在就整段跳过。

```cpp
// File bar.h
#ifndef BAR_H
#define BAR_H

int add(int, int);

#endif
```

`#ifndef` 判断宏是否未定义，`#define` 定义它，中间的代码只在第一次包含时生效。宏名按惯例用文件名的大写下划线形式，避免和其他文件的宏同名。

GCC 和 Clang 还支持另一种写法：

```cpp
#pragma once
```

`#pragma once` 让编译器记录这个文件是否已经包含过，不用手写宏名，也就没有宏名冲突的问题。它不在 C++ 标准里，但主流编译器都支持，工程项目里用得很多。竞赛单文件用不上这两种写法，但阅读工程代码时会遇到。

## extern 说明符

一个文件想用另一个文件里定义的变量，得先声明。这时候用 `extern`：

```cpp
extern int myVar;
```

`extern` 告诉编译器：`myVar` 是别的文件定义的，这里只为它取个名字，不要分配内存。声明和定义的分工，在《变量说明符》一章里讲过。

`extern` 声明不分配空间，所以声明数组时可以不写长度：

```cpp
extern int a[];   // 到底多大，由定义它的那个文件决定
```

这类跨文件共享的变量声明可以直接写在源文件里，也可以放进头文件，由需要它的文件 `#include`。

## static 说明符

默认情况下，文件最外层的全局变量可以被其他文件引用。如果不希望这样——比如两个文件里各有一个叫 `cnt` 的辅助变量，不希望它们互相干扰——就加上 `static`：

```cpp
static int foo = 3;
```

`static` 把变量的链接属性从“外部链接”改成“内部链接”，其他文件看不到这个名字，因此其他文件可以使用同名变量。

包含卫士用宏，这里用 `static`，解决的是同一类问题：**命名冲突**。

## 编译策略

多文件项目如果每次改动都全量重编，很耗时间。标准的做法是把编译拆成两步：先用 `-c`（compile）把每个源文件单独编译成**目标文件（object file）**，再把所有目标文件**链接（link）**成可执行文件。

```bash
g++ -std=c++17 -O2 -c foo.cpp   # 生成 foo.o
g++ -std=c++17 -O2 -c bar.cpp   # 生成 bar.o
g++ -o foo foo.o bar.o          # 链接
```

`-c` 只编译不链接，产物是 `.o`（Windows 上是 `.obj`）。它不是可执行文件，只是编译过程中的中间产物，文件名和源文件相同，后缀换成 `.o`。逐个书写较繁琐时，同样可以用通配符：`g++ -c *.cpp`、`g++ -o foo *.o`。

只重编改过的源文件，其余 `.o` 沿用已有的文件，最后重新链接一次。链接的耗时低于编译，因此可以节省时间。

编译和链接是两个阶段，报错也据此分为两类：

- **编译错误**，比如 `error: expected ';' before ...`，说明这个文件的语法或类型有问题，改这一个文件就行；
- **链接错误**，比如 `undefined reference to ...`，说明语法都通过了，但某个名字谁也拿不出定义——常见原因是漏了一个源文件，或者函数原型和定义对不上。

竞赛里的报错几乎都是前者；后者基本只出现在多文件工程里。

## make 命令

文件数量增多后，谁依赖谁、该重编哪些难以手工维护，于是有了专门的构建工具 make。

make 会在当前目录找配置文件 `makefile`（或 `Makefile`），里面用一条条规则描述“某个产物由哪些文件生成、用什么命令生成”。一条规则写两行：第一行是产物名，冒号后面列依赖的文件；第二行是生成命令。

```makefile
foo.o: foo.cpp
	g++ -std=c++17 -O2 -c foo.cpp
```

第二行开头的缩进必须是**一个 Tab 字符**，用空格会报 `missing separator`。这是 makefile 常见的错误。

完整的 makefile 由多条规则组成：

```makefile
foo: foo.o bar.o
	g++ -o foo foo.o bar.o

foo.o: bar.h foo.cpp
	g++ -std=c++17 -O2 -c foo.cpp

bar.o: bar.h bar.cpp
	g++ -std=c++17 -O2 -c bar.cpp
```

这里有三个产物（`foo.o`、`bar.o`、`foo`），各配一条规则。写依赖时要把间接依赖也列上：`foo.o` 由 `foo.cpp` 编译而来，而 `foo.cpp` 包含了 `bar.h`，所以 `bar.h` 一改，`foo.o` 也得重编。

要用哪条规则，就在 `make` 后面写产物名：

```bash
make foo.o
make bar.o
make foo
```

`make` 后面什么都不写，就执行第一条规则。所以惯例是把最终可执行文件的规则放在最前面——执行 `make` 就能拿到成品。规则在文件里的先后顺序本身不影响正确性。

make 根据文件时间戳判断是否需要重编：拿每个源文件的时间戳跟产物比，比产物新的才需要重编，受影响的下游产物跟着重编，其余一概不动。比如改过 `foo.cpp`、没动 `bar.cpp` 和 `bar.h`，那么 `make foo` 只会重编 `foo.o`，再把新的 `foo.o` 和旧的 `bar.o` 链接起来，`bar.o` 不重编。

竞赛里用不上 make：一个源文件，一条 `g++` 命令就够了。不过本地对拍、管理多份代码时，写个几行的 makefile 或者 shell 脚本也很常见，原理就是上面这些。
