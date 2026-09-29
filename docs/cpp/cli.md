---
title: "命令行环境"
description: "程序从命令行启动时，可以通过参数接收输入、通过退出状态汇报结果，还能读取环境变量。"
---
# 命令行环境

竞赛里最常敲的两条命令，一条编译，一条运行：

```bash
g++ -std=c++17 -O2 -o a a.cpp && ./a
```

`&&` 表示前一条成功才执行后一条。`./a` 里的 `./` 是“当前目录”的意思——不写它，Shell 只会去 `PATH` 列出的那些目录里找 `a`，找不到。本章讲的就是这条命令行上的信息：程序怎么拿到命令行参数、怎么把结果汇报给 Shell、怎么读取环境变量。

## 命令行参数

程序可以从命令行接收参数。按上面的方式编译出 `a` 之后，这样运行：

```bash
./a hello world
```

启动程序时，Shell 会把 `./a`、`hello`、`world` 三部分都交给它，放在 `main()` 的参数里接收。

`main()` 的完整形式有两个参数：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    for (int i = 0; i < argc; i++)
        cout << "arg " << i << ": " << argv[i] << '\n';
    return 0;
}
```

两个参数的名字可以随便取，但约定俗成都叫 `argc` 和 `argv`。

`argc` 是 argument count，命令行参数的个数。**程序名也算一个**，所以 `./a hello world` 对应的 `argc` 是 `3` 而不是 `2`。写代码时要记住这一点：真正的参数从 `argv[1]` 开始。

`argv` 是 argument vector，一个字符串指针数组。`argv[0]` 是程序名（这里是 `./a`，具体内容由调用方决定，不要拿它做判断），`argv[1]` 是 `hello`，`argv[2]` 是 `world`，`argv[argc]` 是空指针 `nullptr`，用来标记数组末尾。`nullptr` 是 C++ 的空指针字面量，它就是 C 里 `NULL` 的替代品，类型更明确。

`char* argv[]` 也可以写成 `char** argv`：前者是“指针的数组”，后者是“指向指针的指针”，在这里是同一件事。同理，`argv[i]` 和 `*(argv + i)` 等价。

### 从命令行读入文件名

竞赛题的数据一般从标准输入读，流程写在代码里就行。但在本地搭测试流程时，让程序自己打开指定的文件更方便：文件名从命令行给，代码里用 `ifstream` 打开。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cout << "用法: " << argv[0] << " <输入文件>\n";
        return 1;
    }

    ifstream fin(argv[1]);
    if (!fin) {
        cout << "打不开文件: " << argv[1] << '\n';
        return 1;
    }

    int n, x, sum = 0;
    fin >> n;
    for (int i = 0; i < n; i++) {
        fin >> x;
        sum += x;
    }
    cout << sum << '\n';
    return 0;
}
```

这样同一份程序可以换着数据跑：`./a test1.in`、`./a test2.in`，不用改代码，也不用写重定向。写对拍脚本时，把数据文件名当参数传进去，脚本和程序就不用互相迁就。`ifstream` 的用法（包括为什么 `fin >> x` 和 `cin >> x` 写法完全一样）见《文件》一章。

注意例子里两处 `return 1`：参数不对、文件打不开，都是出错退出。返回的这个数字就是下一节要讲的退出状态。

`argc` 还可以用来卡住参数的个数：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    if (argc != 3) {
        cout << "usage: mult x y\n";
        return 1;
    }
    cout << atoi(argv[1]) * atoi(argv[2]) << '\n';
    return 0;
}
```

`argc` 不等于 `3` 就打印用法并退出，保证往下走的时候参数一定齐全。`atoi()` 把字符串转成 `int`，来自 `<cstdlib>`。C++ 里更常用的是 `stoi()`（来自 `<string>`），它遇到非法输入会抛异常，比 `atoi()` 静默返回 `0` 更容易发现问题。

既然 `argv` 以空指针收尾，遍历也可以不依赖 `argc`：

```cpp
for (char** p = argv; *p != nullptr; p++)
    cout << "arg: " << *p << '\n';
```

`p` 从 `argv` 出发逐个后移，遇到空指针就停。注意不能直接写 `argv++`——数组名不能自增，所以借了一个中间指针 `p`。

## 退出状态

`main()` 的返回值就是程序的**退出状态（exit status）**，交给 Shell 使用。返回 `0` 表示一切正常，返回非零值表示出了问题。

C++ 规定，`main()` 里不写 `return` 语句时，等价于在结尾写了一句 `return 0`。只有 `main()` 有这份特殊待遇；其他声明了返回类型的函数不写 `return` 就返回，行为是未定义的。不过写不写能看出是“有意为之”，所以竞赛代码里还是老老实实写 `return 0;`。

`<cstdlib>` 定义了两个宏，比裸写数字更清楚：

- `EXIT_SUCCESS`：正常结束，值就是 `0`。
- `EXIT_FAILURE`：异常结束，是一个非零值（具体是多少由实现决定）。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ifstream fin("data.in");
    if (!fin) {
        cout << "找不到 data.in\n";
        return EXIT_FAILURE;
    }

    // ... 正常处理
    return EXIT_SUCCESS;
}
```

Shell 用 `$?` 读上一条命令的退出状态：

```bash
./a hello world
echo $?
```

输出 `0` 说明上一条命令成功，非零就说明出了问题。对拍脚本、批处理脚本靠的就是这个值来判断“该不该继续往下跑”。

竞赛里这一条有实际意义：评测机跑完程序后，会先看退出状态，再看输出。程序非正常结束（段错误、除零、`std::bad_alloc` 之类）通常直接判为运行错误（Runtime Error）。所以别在中间随手 `return 1`。

## 环境变量

环境变量是操作系统传给进程的一批键值对，比如 `HOME` 指向用户主目录、`PATH` 记录命令的搜索路径。程序用 `getenv()` 读它们，这个函数来自 `<cstdlib>`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    char* val = getenv("HOME");

    if (val == nullptr) {
        cout << "找不到 HOME 环境变量\n";
        return 1;
    }

    cout << "Value: " << val << '\n';
    return 0;
}
```

`getenv()` 返回字符串指针，变量不存在时返回空指针，所以取到之后要先判空再使用。它返回的内存由运行时环境管理，不归你管，不要试图去改或者释放。

竞赛里用不到环境变量：评测机给的是干净环境，数据都从标准输入来。它更多出现在构建脚本、CI 和本地开发工具里，作为常识了解即可。
