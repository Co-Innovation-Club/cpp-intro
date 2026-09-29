---
title: "流程控制"
description: "程序默认从上到下顺序执行，想改变执行路径就得靠流程控制语句：条件判断用 if 和 switch，循环用 while、do…while 和 for，另外还有 break、continue 和 goto 三个跳转语句。"
---
# 流程控制

程序默认是从上到下顺序执行的：先执行前一条语句，再执行后一条。可现实里的算法很少这么老实——要按条件分支，要反复做同一件事。控制执行路径的语法就是**流程控制语句**，分条件执行和循环执行两大类。

## if 语句

`if` 用于条件判断，条件成立时执行指定的语句：

```cpp
if (expression) statement
```

`expression` 的值不为 `0` 就视为真，此时执行 `statement`。判断条件外面的圆括号是语法要求，不能省。语句体可以是一条语句，也可以是套在大括号里的复合语句。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int x;
    cin >> x;
    if (x == 10)
        cout << "x is 10" << '\n';
    return 0;
}
```

（开头这两行是竞赛代码的标配：`bits/stdc++.h` 一次引入全部标准库，`using namespace std;` 省去 `std::` 前缀，详见《C++ 简介》。）

语句体只有一条时，习惯上仍然另起一行；有多条语句则必须放进大括号：

```cpp
if (line_num == MAX_LINES) {
    line_num = 0;
    page_num++;
}
```

`if` 可以带 `else` 分支，条件不成立（值为 `0`）时执行它：

```cpp
if (expression) statement
else statement
```

```cpp
if (i > j)
    max = i;
else
    max = j;
```

把 `else` 后面接一个新的 `if`，就成了多重判断：

```cpp
if (expression)
    statement
else if (expression)
    statement
...
else if (expression)
    statement
else
    statement
```

有一个细节必须记住：**`else` 总是跟离它最近的那个 `if` 配对**。

```cpp
if (number > 6)
    if (number < 12)
        cout << "The number is more than 6, less than 12.\n";
else
    cout << "It is wrong number.\n";
```

这段代码里，`else` 配的是内层的 `if (number < 12)`，不是外层那个。所以 `number` 等于 6 时，外层条件不成立，内层根本不会执行，`else` 也不会执行——什么都不会输出。想表达"不满足 `number > 6` 时输出错误"的原意，得加大括号把归属写死：

```cpp
if (number > 6) {
    if (number < 12)
        cout << "The number is more than 6, less than 12.\n";
} else {
    cout << "It is wrong number.\n";
}
```

多层 `if` 嵌套时，大括号既是给编译器看的边界，也是给读代码的人看的。

## 三元运算符 ?:

三元运算符 `?:` 是 `if...else` 的表达式版本，形式如下：

```cpp
<expression1> ? <expression2> : <expression3>
```

`expression1` 为真就取 `expression2` 的值，否则取 `expression3` 的值。取两个数中的较大值：

```cpp
int max_val = (i > j) ? i : j;
```

等价于：

```cpp
int max_val;
if (i > j)
    max_val = i;
else
    max_val = j;
```

差别在于 `?:` 是一个**表达式**，它有值，可以直接塞进别的地方——赋值右边、函数实参、`cout <<` 后面都行，这是 `if` 语句做不到的。竞赛里写状态转移、取最值、输出 `Yes`/`No` 时经常用到：

```cpp
cout << (n % 2 == 0 ? "even" : "odd") << '\n';
```

用它的时候注意两点：嵌套要加括号，否则优先级容易出错；`expression2` 和 `expression3` 的类型要能互相兼容，否则编译器会按隐式转换规则挑一个"公共类型"，可能悄悄丢精度。

## switch 语句

`switch` 是 `if...else` 的一种特殊形式，专门对付"同一个表达式的多个取值各走一个分支"的情况。它比一长串 `else if` 更直观。

```cpp
switch (expression) {
    case value1: statement
    case value2: statement
    default: statement
}
```

```cpp
switch (grade) {
    case 0:
        cout << "False" << '\n';
        break;
    case 1:
        cout << "True" << '\n';
        break;
    default:
        cout << "Illegal" << '\n';
}
```

`grade` 等于 `0` 就走 `case 0`，等于 `1` 就走 `case 1`，都不匹配就走 `default`。

`switch` 有条件限制：括号里必须是整型或可以转成整型的表达式，比如 `int`、`char`、`bool`、`enum`；`double`、`std::string` 都不行。`case` 后面的值必须是编译期就能定下来的常量，不能是变量。

**每个 `case` 的结尾都要有 `break`**，它的作用是跳出整个 `switch`，不再往下走。漏掉 `break`，程序会继续执行下一个 `case` 的语句体，这叫穿透（fallthrough）：

```cpp
switch (grade) {
    case 0:
        cout << "False" << '\n';   // 这里少了 break
    case 1:
        cout << "True" << '\n';
        break;
    default:
        cout << "Illegal" << '\n';
}
```

上面 `grade` 等于 `0` 时，会先输出 `False`，接着不跳出、继续输出 `True`，最后才被 `case 1` 末尾的 `break` 拦住。这几乎总是 bug。

穿透本身也能当特性用：多个取值要执行同一段逻辑时，让它们共用一份语句体，前面几个 `case` 留空：

```cpp
switch (grade) {
    case 0:
    case 1:
        cout << "True" << '\n';
        break;
    default:
        cout << "Illegal" << '\n';
}
```

`case` 后面本来就不需要写大括号，这也是必须手写 `break` 的原因。要想清楚"这一段语句属于哪个 case"，只能靠自己盯着看，所以参赛代码里 `switch` 用得比 `if` 少，尤其在分支里要读入、要算东西的时候，`if` 更不容易出错。

`default` 处理所有 `case` 都不匹配的情况。它放在最后就省了 `break`；当然也可以不写这个分支，那样遇到不匹配的值就直接跳出 `switch`。

## while 语句

`while` 用于循环：条件为真就一直执行循环体。

```cpp
while (expression)
    statement
```

每轮开始前判断一次 `expression`，非零就执行循环体，执行完再回来判断，直到为零才跳出。

```cpp
while (i < n)
    i = i + 2;
```

上面只要 `i` 小于 `n`，就每次加 2。循环体有多个语句时要加大括号：

```cpp
while (expression) {
    statement;
    statement;
}
```

下面这个例子把 `i` 从 0 数到 9：

```cpp
i = 0;
while (i < 10) {
    cout << "i is now " << i << '\n';
    i++;
}
cout << "All done!\n";
```

条件永远为真的 `while` 就是死循环，写成 `while (1)` 或更时髦的 `while (true)`：

```cpp
while (1) {
    // ...
}
```

死循环本身没问题，循环体内部用 `break` 跳出来就行。竞赛里常见的场景是"一直读、一直处理，直到满足某个条件停手"。

**一个竞赛里的高频写法**：反复读入直到没有数据可读。

```cpp
int x;
while (cin >> x) {
    // 每读到一个 x 就处理一次
    // 读到输入结束（EOF）时，cin 的值为假，循环自然退出
}
```

`cin >> x` 这个表达式本身有值——读到数据时为真，遇到文件结束或格式错误时为假。所以它能直接当条件用，不用手动去判断 EOF。如果题目规定了终止标志，就再加一个判断：

```cpp
int n;
while (cin >> n && n != 0) {
    // n 为 0 表示输入结束
}
```

## do...while 结构

`do...while` 是 `while` 的变体，差别在于它**先执行一次循环体，再判断条件**：

```cpp
do statement
while (expression);
```

不管条件是否成立，循环体至少执行一次；从第二轮起才按条件来。

```cpp
i = 10;

do --i;
while (i > 0);
```

上面先把 `i` 减 1，再判断 `i > 0`，成立就继续减，直到 `i` 变成 `0` 停下。

循环体有多条语句时放进大括号：

```cpp
i = 10;

do {
    cout << "i is " << i << '\n';
    i++;
} while (i < 10);

cout << "All done!\n";
```

这里 `i` 一开始是 `10`，并不满足 `i < 10`，但循环体照样执行了一次，输出 `i is 10`。

注意 `do...while` 结尾的分号：`while (expression);` 后面那个分号是语法的一部分，漏了会直接编译报错。竞赛里 `do...while` 用得不多，一般只在"先做一次、再看要不要继续"的逻辑里更顺手，比如反复读字符直到读满。

## for 语句

`for` 是最常用的循环，适合"循环次数已经知道"的场合：

```cpp
for (initialization; continuation; action)
    statement;
```

圆括号里有三个表达式，用分号隔开：

- `initialization`：初始化，只在循环开始前执行一次，通常用来声明循环变量；
- `continuation`：判断条件，每轮开始前检查，为真就继续；
- `action`：每轮循环体执行完后运行，通常用来更新循环变量。

```cpp
for (int i = 10; i > 0; i--)
    cout << "i is " << i << '\n';
```

变量 `i` 在 `for` 的第一个表达式里声明，作用域被限制在这层循环里，出了循环就消失。所以同一个函数里写两个 `for`，各自用 `int i` 声明不会冲突。

三个位置都可以放多个表达式，用逗号分隔：

```cpp
for (int i = 0, j = 999; i < 10; i++, j--) {
    cout << i << ' ' << j << '\n';
}
```

上面初始化部分同时对 `i` 和 `j` 赋值，`action` 部分同时更新两者。

三个表达式都可以省略，全省略就是死循环：

```cpp
for (;;) {
    cout << "本行会无限循环地打印。\n";
}
```

竞赛里最常见的写法是遍历数组下标：

```cpp
int n, a[1005];
cin >> n;
for (int i = 0; i < n; i++)
    cin >> a[i];
```

从 `0` 开始、用 `<` 而不是 `<=`，这是 C++ 里贯穿始终的习惯。它和 STL 容器的下标范围的约定一致，看别人的代码、用标准库函数时不会错位。

### 范围 for

C++11 引入了**范围 for**（range-based for），专门用来遍历一个现成的序列（数组、`vector`、`string`、`map` 都行），不用自己管下标：

```cpp
vector<int> v = {1, 2, 3, 4, 5};

for (int x : v)
    cout << x << ' ';   // 依次输出 1 2 3 4 5
```

读法就是"对 `v` 里的每一个 `x`"，把原来 `for (int i = 0; i < v.size(); i++)` 那一套下标和边界判断全省了。数组也一样能用：

```cpp
int a[5] = {1, 2, 3, 4, 5};
int sum = 0;
for (int x : a)
    sum += x;   // sum = 15
```

`int x` 是**值拷贝**：改 `x` 不会影响容器里的元素。真要在遍历时改元素，得用引用：

```cpp
for (int &x : v)
    x *= 2;   // v 里每个元素都翻倍

for (const auto &x : v)   // 元素类型大或不知道类型时，用 const 引用只读遍历
    cout << x << ' ';
```

`auto` 在这里很省事，尤其是元素类型又长又绕的时候。遍历 `map` 拿到的是一对键值：

```cpp
map<string, int> cnt;
for (const auto &p : cnt)
    cout << p.first << ' ' << p.second << '\n';
```

需要留意的是，范围 for 底层就是迭代器在走，所以循环体里**不能改变容器的大小**（`push_back`、`erase` 会让迭代器失效，行为未定义）。要边遍历边增删，还是老老实实用下标或迭代器写普通 `for`。

### 竞赛里常见的读入循环

读入的骨架几乎都长一个样：先读数据规模，再按规模循环读元素；如果数据组数不定，就用 `while (cin >> x)` 读到结束。这个模式上面已经出现两次，实际题目里也就这几种变体：

```cpp
// 读 n 个数
int n;
cin >> n;
for (int i = 0; i < n; i++) cin >> a[i];

// 读 n 行，每行一个字符串
for (int i = 0; i < n; i++) cin >> s[i];

// 多组数据，组数不定
while (cin >> n) {
    // 处理这一组
}
```

带读入的题目想卡时间，还得在 `main` 开头加上两句加速：

```cpp
ios::sync_with_stdio(false);
cin.tie(nullptr);
```

细节见《输入输出》一章。

## break 语句

`break` 有两种用途，一种是前面讲过的跳出 `switch` 分支，另一种是跳出循环。

在循环里遇到 `break`，立刻终止**当前这一层**循环，后面的轮次不再执行：

```cpp
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        cout << i << ' ' << j << '\n';
        break;   // 只跳出内层的 j 循环
    }
}
```

`break` 只跳出它直接所在的那一层。上面这个双层循环里，它结束的是 `j` 循环，`i` 循环照常推进到下一轮。

跳出单层循环的另一个常见场景是"找到一个就收工"：

```cpp
for (int i = 0; i < n; i++) {
    if (a[i] == target) {
        cout << i << '\n';
        break;      // 找到就不用再往下找了
    }
}
```

注意 `break` 只能跳出循环和 `switch`，**跳不出 `if`**：

```cpp
if (n > 1) {
    if (n > 2) break;   // 编译报错：这里没有可跳出的循环或 switch
    cout << "hello\n";
}
```

## continue 语句

`continue` 结束本轮循环，直接进入下一轮。循环体里排在它后面的语句本轮不再执行：

```cpp
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        cout << i << ' ' << j << '\n';
        continue;   // 后面没别的语句了，写不写效果一样
    }
}
```

真正有用的是"跳过不想要的元素"：

```cpp
for (int i = 0; i < n; i++) {
    if (a[i] < 0) continue;   // 负数不参与
    sum += a[i];
}
```

`continue` 和 `break` 的区别要分清：`break` 是"这层循环到此为止"，`continue` 是"这一轮到此为止，下一轮照旧"。

对 `while` 和 `do...while` 用 `continue` 时要留个神：它跳回条件判断之前，会跳过循环体里对循环变量的更新，如果更新写在循环体末尾，就可能变成死循环。

```cpp
int i = 0;
while (i < 10) {
    if (i % 2) continue;   // i 为奇数就直接回到判断，i 一直不加
    i++;                   // 永远执行不到，死循环
}
```

改法很简单，把 `i++` 提到 `continue` 前面，或者干脆用 `for`——`for` 的更新表达式在 `continue` 之后仍然会执行，不存在这个坑。

## goto 语句

`goto` 直接跳到指定的标签（label）处。标签就是一个名字加冒号，放在正常语句前面：

```cpp
char ch;

top:
ch = cin.get();

if (ch == 'q')
    goto top;
```

上面这段读一个字符，读到 `q` 就跳回 `top` 重新读，相当于一个 `while` 循环。

`goto` 能任意跳转，会破坏程序的结构，所以工程代码里基本不用。竞赛里它只在一个场合有价值：**从多层嵌套循环里一次跳出来**。前面说过 `break` 只能跳一层，深层嵌套时用标志位配合 `break` 要写得很啰嗦：

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, k, a[1005];

int main() {
    cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (a[i] + a[j] == k) {
                cout << i << ' ' << j << '\n';
                goto done;      // 找到一组就跳出两层循环
            }
        }
    }
    cout << "not found\n";

done:
    return 0;
}
```

换成不用 `goto` 的写法，就得在外层再判一次标志：

```cpp
bool found = false;
for (int i = 0; i < n && !found; i++) {
    for (int j = i + 1; j < n; j++) {
        if (a[i] + a[j] == k) {
            found = true;
            break;      // 只跳出内层
        }
    }
}
```

两层还行，四五层嵌套时 `goto` 确实更清楚。这也是竞赛代码里能见到 `goto` 的少数理由。用的时候记住两条：标签名不能和别的标识符重名；`goto` 只能在同一个函数内部跳，跳不到别的函数里去，也不能跳过变量的初始化溜进它的作用域。
