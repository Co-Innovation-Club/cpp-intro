---
title: "流程控制"
description: "程序默认从上到下顺序执行，想改变执行路径就得靠流程控制语句：条件判断用 if 和 switch，循环用 while、do…while 和 for，另外还有 break、continue 和 goto 三个跳转语句。"
---
# 流程控制

程序默认从上到下顺序执行：先执行前一条语句，再执行后一条。算法通常需要按条件分支，或者重复执行同一段语句。控制执行路径的语法是**流程控制语句**，分为条件执行和循环执行两类。

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

**`else` 与离它最近的那个 `if` 配对。**

```cpp
if (number > 6)
    if (number < 12)
        cout << "The number is more than 6, less than 12.\n";
else
    cout << "It is wrong number.\n";
```

这段代码里，`else` 配的是内层的 `if (number < 12)`，不是外层那个。`number` 等于 6 时，外层条件不成立，内层不会执行，`else` 也不会执行，没有任何输出。要表达“不满足 `number > 6` 时输出错误”，需要用大括号限定 `else` 的归属：

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

差别在于 `?:` 是一个**表达式**，它有值，可以用在赋值右侧、函数实参、`cout <<` 之后，这是 `if` 语句做不到的。竞赛里写状态转移、取最值、输出 `Yes`/`No` 时经常用到：

```cpp
cout << (n % 2 == 0 ? "even" : "odd") << '\n';
```

使用 `?:` 时有两点限制：嵌套时应加括号以避免优先级问题；`expression2` 与 `expression3` 的类型需要兼容，否则编译器会按隐式转换规则选择一个公共类型，可能损失精度。

## switch 语句

`switch` 是 `if...else` 的一种特殊形式，用于处理同一个表达式的多个取值分别对应不同分支的情况。它比一长串 `else if` 更直观。

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

`grade` 等于 `0` 时执行 `case 0`，等于 `1` 时执行 `case 1`，都不匹配时执行 `default`。

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

上面 `grade` 等于 `0` 时，会先输出 `False`，随后继续执行 `case 1` 的语句体，输出 `True`，直到 `case 1` 末尾的 `break` 才跳出。这种情况通常属于代码错误。

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

`case` 后面不写大括号，语句体的范围由下一个 `case` 标签或 `break` 决定，因此需要显式写出 `break`。语句的归属不如 `if` 明确，竞赛代码里 `switch` 的使用少于 `if`；当分支中需要读入数据或执行计算时，`if` 的结构更清晰。

`default` 处理所有 `case` 都不匹配的情况。它放在末尾时不需要 `break`；也可以不写这个分支，此时遇到不匹配的值直接跳出 `switch`。

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

条件恒为真的 `while` 构成死循环，可写成 `while (1)` 或 `while (true)`：

```cpp
while (1) {
    // ...
}
```

循环体内部可以用 `break` 跳出死循环。竞赛里常见的场景是持续读入并处理，直到满足某个条件退出。

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

注意 `do...while` 结尾的分号：`while (expression);` 后面的分号是语法的一部分，漏写会导致编译错误。竞赛里 `do...while` 用得不多，适用于先执行一次、再判断是否继续的场景，例如反复读字符直到读满。

## for 语句

`for` 是最常用的循环，适合“循环次数已经知道”的场合：

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

C++11 引入**范围 for**（range-based for），用于遍历数组、`vector`、`string`、`map` 等序列，不需要自行维护下标：

```cpp
vector<int> v = {1, 2, 3, 4, 5};

for (int x : v)
    cout << x << ' ';   // 依次输出 1 2 3 4 5
```

语义是“对 `v` 中的每个 `x` 执行一次循环体”，省去了 `for (int i = 0; i < v.size(); i++)` 中的下标与边界判断。数组同样适用：

```cpp
int a[5] = {1, 2, 3, 4, 5};
int sum = 0;
for (int x : a)
    sum += x;   // sum = 15
```

`int x` 是**值拷贝**：修改 `x` 不会影响容器里的元素。需要在遍历时修改元素，则使用引用：

```cpp
for (int &x : v)
    x *= 2;   // v 里每个元素都翻倍

for (const auto &x : v)   // 元素类型大或不知道类型时，用 const 引用只读遍历
    cout << x << ' ';
```

元素类型较长时可用 `auto` 推导。遍历 `map` 得到的是一对键值：

```cpp
map<string, int> cnt;
for (const auto &p : cnt)
    cout << p.first << ' ' << p.second << '\n';
```

范围 for 基于迭代器实现，循环体中**不能改变容器的大小**：`push_back`、`erase` 会使迭代器失效，行为未定义。需要在遍历过程中增删元素时，改用下标或迭代器形式的 `for`。

### 竞赛里常见的读入循环

读入部分的结构通常是：先读数据规模，再按规模循环读元素；数据组数不定时，用 `while (cin >> x)` 读到输入结束。该模式在前文已出现两次，实际题目中的写法多为以下几种变体：

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

输入量较大的题目可以在 `main` 开头加入以下两行以提高输入输出速度：

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

跳出单层循环的另一个场景是找到目标后结束查找：

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

`continue` 的典型用法是跳过不需要处理的元素：

```cpp
for (int i = 0; i < n; i++) {
    if (a[i] < 0) continue;   // 负数不参与
    sum += a[i];
}
```

`break` 终止本层循环；`continue` 结束本轮循环体的执行，其余轮次继续执行。

在 `while` 和 `do...while` 中使用 `continue` 时，控制流跳回条件判断之前，会跳过循环体中对循环变量的更新；若更新语句位于 `continue` 之后，可能形成死循环。

```cpp
int i = 0;
while (i < 10) {
    if (i % 2) continue;   // i 为奇数就直接回到判断，i 一直不加
    i++;                   // 永远执行不到，死循环
}
```

可将 `i++` 移到 `continue` 之前，或改用 `for`：`for` 的更新表达式在 `continue` 之后仍会执行，不会出现上述问题。

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

`goto` 可以跳转到任意标签，破坏程序的结构，工程代码里基本不用。竞赛里它只在一个场合有价值：**从多层嵌套循环里一次跳出来**。前文提到 `break` 只能跳一层，深层嵌套时用标志位配合 `break` 需要再写一层判断：

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

嵌套两层时两种写法的差别不明显；嵌套四五层时 `goto` 的控制流更清楚，这是竞赛代码中出现 `goto` 的少数场景。使用 `goto` 有两条限制：标签名不能与其他标识符重名；跳转只能在同一个函数内部进行，不能跨函数，也不能跳过变量的初始化进入其作用域。
