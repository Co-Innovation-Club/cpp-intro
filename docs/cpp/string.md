---
title: "字符串"
description: "C++ 用 std::string 表示字符串，本章讲它的长度、复制、拼接、比较、查找与整行读入，并对照介绍底层的字符数组与 C 字符串函数。"
---
# 字符串

## 简介

C++ 里处理字符串有两条路。一条是 C 传下来的：语言没有专门的字符串类型，字符串就是一个 `char` 数组。另一条是标准库给的 `std::string`（下称 `string`），写起来省事得多，竞赛里基本都用它。本章以 `string` 为主线，C 字符串作为底层背景对照着讲——因为字符串在内存里终究是字符数组，碰到 `char buf[100]` 这种读入缓冲区、或者读别人的题解时，你得看得懂。

先看底层。字符串是一段连续的字符，一个挨一个存放：

```cpp
char s[] = {'H', 'e', 'l', 'l', 'o', '\0'};
// 等价于
char s[] = "Hello";
```

结尾那个全是二进制 0 的字节写作 `'\0'`，叫**空字符（null character）**，用来标记字符串到此结束。`'\0'` 和字符 `'0'` 不是一回事：前者的 ASCII 值是 0，后者是 48。所以 `"Hello"` 实际占 6 个字节——5 个字符加一个 `'\0'`。

有了这个结尾标记，程序不必事先知道长度就能扫完一个字符串：一个字节一个字节看下去，看到 `\0` 就停。这是 C 字符串的全部机制，也是它所有坑的源头——长度靠“数到 0”得来，一旦某处忘了补 `\0`，后面所有依赖它的函数都会一路读穿内存。

双引号写的是字符串，单引号写的是字符，两者不能混用：

```cpp
char c = 'A';     // 字符，占 1 字节
char s[] = "A";   // 字符串，占 2 字节：'A' 和 '\0'
```

哪怕双引号里只有一个字符，它仍然是字符串。单引号里写多个字符（比如 `'Hello'`）则是编译错误。

字符串内部要放双引号、换行、制表符，用反斜杠转义：

```cpp
"She replied, \"It does.\""
"Hello, world!\n"
"第一列\t第二列"
```

字面量太长可以折行。一行尾部写反斜杠表示续行，但下一行不能缩进，否则缩进会被算进字符串；更好的做法是把几段字面量并排写，编译器会把它们粘起来：

```cpp
string greeting = "Hello, "
                  "how are you "
                  "today!";
// 等同于 "Hello, how are you today!"
```

上面用的是 `string`，字符数组同样支持这种相邻字面量的拼接。

现在看 C++ 的推荐做法。`std::string` 是标准库提供的一个类，内部替你管理一段字符缓冲区（含结尾的 `\0`），把长度、拼接、比较、查找这些操作都做成了成员函数或运算符。它来自头文件 `<string>`，在竞赛里被 `bits/stdc++.h` 一并包含。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s = "Hello";
    cout << s << " " << s.size() << '\n';   // Hello 5
    return 0;
}
```

开头两行是竞赛代码的固定写法：`bits/stdc++.h` 是 GCC 的“万能头文件”，一次把标准库几乎全部引进来，代价只是编译稍慢；`using namespace std;` 让 `std::` 前缀可以省略。原因和代价见《C++ 简介》。下面各节都以 `string` 为主，需要时再拿出 C 的写法对照。

## 字符串变量的声明

`string` 的声明和普通变量一样，可以直接用字面量初始化，也可以用另一个 `string` 初始化：

```cpp
string s1;                    // 空字符串，长度 0
string s2 = "Hello, world!";  // 从字面量
string s3 = s2;               // 从另一个 string 复制，s3 是独立的一份
string s4(5, 'x');            // "xxxxx"，5 个字符 'x'
```

`s1` 是空串，不是“没有值”——`string` 一定会把自己初始化干净，这一点比裸数组省心，不必担心里面是随机内容。

作为对照，C 风格的写法有两种：字符数组和字符指针。

```cpp
char s[14] = "Hello, world!";   // 字符数组
char* p = "Hello, world!";      // 字符指针
```

字符数组的长度可以省略，编译器按字面量自动算，这里是 14（13 个字符加 `\0`）。长度也可以开得比实际需要大：

```cpp
char s[50] = "hello";   // 后面空出来的字节全部填 '\0'
```

但不能比实际需要小：

```cpp
char s[5] = "hello";    // 报错：装不下 6 个字节
```

这两种 C 写法有两个关键差异。

第一，**字符指针指向的字符串不可写**。字面量存放在只读的常量区，通过指针去改它属于未定义行为，运行时很可能直接崩：

```cpp
char* p = "Hello";
p[0] = 'z';   // 错误

char s[] = "Hello";
s[0] = 'z';   // 可以：数组是自己的一份内存，内容随便改
```

第二，**指针可以改指别的字符串，数组不行**：

```cpp
char* p = "hello";
p = "world";    // 可以，p 换了个地址

char s[] = "hello";
s = "world";    // 报错：数组名绑定的地址不能改
```

改数组内容只能用 `strcpy()` 把新内容拷进去（见「C 字符串函数：一组背景对照」），地址仍然不变。

`string` 把这两件事统一了：`s[0] = 'z'` 合法，`s = "world"` 也合法。它自己管着缓冲区，你不用担心字面量在只读区、也不担心数组名和地址绑死。

不过 `string` 并不是处处安全，要分清它安全在哪里：

```cpp
string s = "hi";
cout << s[5];     // 未定义行为：s[i] 不做越界检查
cout << s.at(5);  // 抛 out_of_range 异常，程序直接终止
```

`s[i]` 和数组一样不检查边界，写错了就是未定义行为；`s.at(i)` 会检查，但检查的代价是抛异常，在竞赛里异常通常只意味着 RE，而不是给你补救的机会。所以该自己确认下标合法就得确认。`string` 真正省心的地方在于拼接和复制不会溢出，而不在于下标访问。

### 读入一行：getline

竞赛输入里的字符串常常带空格，这时**不能**用 `cin >> s`：

```cpp
string s;
cin >> s;   // 遇到空格、制表符、换行就停，只能读到一个"词"
```

读整行要用 `getline`：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    getline(cin, line);            // 读一整行，不含结尾的换行符
    cout << line.size() << '\n';
    cout << line << '\n';
    return 0;
}
```

`getline(cin, s)` 从 `cin` 读一行放进 `s`，换行符被丢掉、不进 `s`。如果流里已经没内容，`s` 会被置成空串，所以它可以配合 `while` 一直读到文件尾：

```cpp
string s;
while (getline(cin, s)) {
    // 每行处理一次
}
```

有个几乎人人都会撞一次的坑：`cin >> n` 后面紧跟 `getline(cin, s)`，`s` 会读到一个空串。因为 `cin >> n` 读完数字后，把行尾的换行符留在了输入流里，`getline` 一上来读到这个换行符就返回了。解决办法是在中间把这一行吃掉：

```cpp
int n;
cin >> n;
string dummy;
getline(cin, dummy);   // 吃掉数字后面的换行符
string s;
getline(cin, s);       // 现在才读到真正的第一行
```

只要出现“先读整数、再读整行”的组合，就要检查这个顺序问题。记一句话：`>>` 会把换行留在流里，`getline` 会把它吃掉。

## 字符串的长度

`string` 有 `size()`，还有一个完全等价的 `length()`，两者都返回字符个数，不含结尾的 `\0`（那不属于字符串内容）：

```cpp
string s = "hello";
cout << s.size() << '\n';     // 5
cout << s.length() << '\n';   // 5，和 size() 完全一样
```

返回类型同样是 `size_t`，无符号。所以数组那章关于 `v.size() - 1` 在空容器上回绕的提醒，对字符串一样成立。判断空串用 `s.empty()` 意思更清楚：

```cpp
if (s.empty()) cout << "空串\n";
```

对照的 C 函数是 `strlen()`，它靠一路扫到 `\0` 来数长度。原型在 C 的 `string.h` 里，C++ 对应 `<cstring>`：

```cpp
size_t strlen(const char* s);
```

```cpp
const char* p = "hello";
printf("%zu\n", strlen(p));   // 5
```

两个概念别混：`strlen()` 得到的是**内容长度**，`sizeof()` 得到的是变量占的**字节数**。

```cpp
char s[50] = "hello";
printf("%zu\n", strlen(s));   // 5
printf("%zu\n", sizeof(s));   // 50
```

`string` 把长度记在对象里，`size()` 是 O(1) 读一个字段；`strlen()` 每次都要从头扫一遍，是 O(长度)。在循环条件里反复写 `strlen(s)` 是经典的性能陷阱，竞赛里更不要这么写——要用就先存进一个变量。

## 字符串的复制

`string` 的复制就是赋值，语义是**深拷贝**：复制出独立的一份，改其中一个不影响另一个。

```cpp
string a = "hello";
string b = a;      // 复制内容
b[0] = 'z';
cout << a << ' ' << b << '\n';   // hello zello
```

字面量、`char*`、字符数组都能赋给 `string`，而且想赋几次赋几次：

```cpp
string s;
s = "abc";
s = "defg";
```

取子串用 `substr`：第一个参数是起始下标，第二个是长度，省略第二个则一直取到结尾。

```cpp
string s = "hello world";
cout << s.substr(0, 5) << '\n';   // hello
cout << s.substr(6) << '\n';      // world
```

`substr` 返回一个新的 `string`，原串不变。它会做边界检查：起始下标大于 `s.size()` 时抛出 `out_of_range`。

C 的写法就麻烦得多。字符数组不能整体赋值：

```cpp
char s1[10];
char s2[10];
s1 = "abc";   // 报错
s2 = s1;      // 报错
```

字符指针的 `=` 也不是复制内容，只是让两个指针指向同一处：

```cpp
char* p1 = "abc";
char* p2 = p1;   // p1 和 p2 指向同一份字面量，并没有复制
```

要真正复制内容，只能调用 `strcpy()`、`strncpy()`，或者自己循环逐字符搬。这几个函数的细节放在后面「C 字符串函数」一节统一讲。

## 字符串的拼接

`string` 用 `+` 拼接，用 `+=` 追加，比 C 的 `strcat()` 直观得多，而且长度自动增长，不会溢出。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string a = "Hello, ";
    string b = "world!";

    string c = a + b;      // 生成新串，a、b 不变
    a += b;                // 修改 a 自己
    cout << c << '\n';     // Hello, world!
    cout << a << '\n';     // Hello, world!

    string s = "abc";
    s += '!';              // 追加一个字符
    s += to_string(42);    // 数字先转成字符串再拼
    cout << s << '\n';     // abc!42
    return 0;
}
```

几处容易踩的地方：

- `+` 两边至少要有一个是 `string`。`"abc" + "def"` 是两个 `const char*` 相加，指针相加没有意义，编译不过；写成 `string("abc") + "def"` 才合法。
- `+` 每次都会生成一个新串，在老串上反复追加时用 `+=` 更划算。
- 拼数字要自己转。`s + 42` 编译不过，得写 `s + to_string(42)`。

`append()` 比 `+` 多几种拼法，能拼上若干个相同字符，或者只拼另一个字符串的前几个字符：

```cpp
string s = "ab";
s.append(3, 'x');       // "abxxx"
s.append("cdef", 2);    // 再拼上 "cd"
```

要拼的东西又多又杂（字符串、数字、字符交替）时，还有个更重的做法是把它们依次塞给 `stringstream`（来自 `<sstream>`），最后一次性取出结果。

C 的对应函数是 `strcat()`，把第二个字符串接到第一个的末尾：

```cpp
char s1[12] = "hello";
char s2[6] = "world";

strcat(s1, s2);    // s1 变成 "helloworld"
```

隐患在于 `strcat()` **完全不检查目标缓冲区还剩多少空间**。上面 `s1` 正好 12 字节，拼完刚好装下；要是写成 `s1[8]`，多出来的字符就会写到数组外面。C 给的补丁是 `strncat()`，多一个“最多追加几个字符”的参数，细节见后面统一讲的对照小节。

## 字符串的比较

`string` 直接用关系运算符比较：`==` 判相等，`<`、`>` 按**字典序（lexicographic order）**，也就是逐字符比 ASCII 码，第一个不同字符的 ASCII 大小决定结果。

```cpp
string a = "banana", b = "apple", c = "banana";

cout << (a == b) << '\n';       // 0，不相等
cout << (a == c) << '\n';       // 1，相等
cout << (a < b) << '\n';        // 0，'b' > 'a'
cout << ("apple" < a) << '\n';  // 1
```

这里能直接用 `==`，是因为 `string` 为比较写好了语义，比的是内容。而 C 的字符数组不能这么比：

```cpp
char s1[] = "abc";
char s2[] = "abc";
if (s1 == s2) { ... }   // 条件恒为假：比的是两个地址，不是内容
```

数组名退化成指针，`==` 比的是地址，两个不同的数组永远不相等。要比较内容只能用 `strcmp()`，它按字典序返回一个整数：相等返回 0，第一个串小返回负数，第一个串大返回正数。

```cpp
if (strcmp(s1, s2) == 0) { ... }   // 判断内容相等
if (strcmp(s1, s2) < 0) { ... }    // 判断 s1 字典序在前
```

**`strcmp` 的返回值只有符号有意义**，具体是 -1 还是 -13 由实现决定，所以不要写 `strcmp(a, b) == -1`。只比较前 `n` 个字符用 `strncmp()`。

`string` 另外提供了 `compare()` 成员函数，返回值同样是“负数 / 0 / 正数”，语义和 `strcmp()` 一致，需要在排序里返回整数时用得上：

```cpp
if (a.compare(b) < 0) { ... }   // a 的字典序在 b 之前
```

竞赛里更实用的场景是排序。`string` 自带 `<`，所以把一堆字符串排成字典序只要一行：

```cpp
vector<string> v = {"banana", "apple", "cherry"};
sort(v.begin(), v.end());   // apple, banana, cherry
```

换成 `char*` 数组就得额外传一个比较函数，而且很容易写成比较指针地址的错误版本。

## 字符串的查找与修改

下面这些事，C 字符串做起来都很别扭，`string` 都是一行。

**查找。** `find(x)` 返回 `x` 第一次出现的下标，找不到返回 `string::npos`——一个表示“无此位置”的特殊常量，值是 `size_t` 的最大值：

```cpp
string s = "hello world";

size_t p = s.find("world");
if (p != string::npos) cout << p << '\n';      // 6

if (s.find('z') == string::npos) cout << "没找到 z\n";
```

`rfind` 从右往左找第一次出现的位置；`find` 也可以指定从哪个下标开始找，例如 `s.find("l", 4)` 从下标 4 开始找 `"l"`。

**下标读写。** `s[i]` 拿到的是 `char` 的引用，可以直接改：

```cpp
string s = "hello";
s[0] = 'H';
cout << s << '\n';   // Hello
```

题目里的字符串处理，大量操作就是循环扫一遍、按需改 `s[i]`。判断或转换单个字符用 `<cctype>` 里的 `isdigit`、`isalpha`、`tolower`、`toupper`（`bits/stdc++.h` 一并包含）：

```cpp
for (char& ch : s) {
    if (isdigit(ch)) ch = '#';      // 数字换成 '#'
    ch = toupper(ch);               // 全部转大写
}
```

注意 `for (char& ch : s)` 里的 `&`：变量是引用，改 `ch` 就是改 `s` 里的字符。写成 `for (char ch : s)` 则是拷贝，改不到原串。

**插入、删除、替换。**

```cpp
string s = "hello";
s.insert(5, " world");   // 在下标 5 处插入，"hello world"
s.erase(5, 6);           // 从下标 5 起删 6 个字符，退回 "hello"
s.replace(1, 4, "i");    // 把 [1, 5) 这段换成 "i"，得到 "hi"
```

这三个函数的共同点是：参数里的下标和长度都得自己保证合法。`insert` 的下标可以等于 `size()`（表示插在末尾），`erase` 的下标必须小于 `size()`，越界就是未定义行为。

**尾部增减**还有更快的写法，和 `vector` 一致：

```cpp
string s;
s.push_back('a');   // 末尾加一个字符，变成 "a"
s.pop_back();       // 删掉末尾一个字符，退回空串
```

**清空与判空。** `s.clear()` 清空，`s.empty()` 判空。

**转成 C 字符串。** 老的接口（`printf` 的 `%s`、`fopen`、`strlen` 等）只认 `const char*`，这时用 `c_str()`：

```cpp
string s = "hello";
printf("%s\n", s.c_str());
```

`c_str()` 返回的指针指向 `string` 自己的内部缓冲区，**只要这个 `string` 被改动或销毁，指针就失效**，不要把它存起来长期使用。

反过来，把 C 字符串转成 `string`，直接赋值即可：

```cpp
char buf[] = "hello";
string s = buf;   // 内容被复制一份，s 与 buf 再无关系
```

## sprintf()，snprintf()

这一组不是 `string` 的成员，而是把数据**格式化写进字符缓冲区**的 C 函数。竞赛里用途很明确：把整数、浮点数按指定格式拼成字符串。

`sprintf()` 的用法和 `printf()` 一样，只是第一个参数换成目标缓冲区，结果写进那里而不是输出到屏幕：

```cpp
char s[40];
string first = "hello", last = "world";

sprintf(s, "%s %s", first.c_str(), last.c_str());
printf("%s\n", s);   // hello world
```

返回值是写入的字符数，不计结尾的 `\0`；出错返回负数。

`sprintf()` 有严重的安全问题：它**不检查缓冲区有多大**，写超了就溢出到别的内存上。缓冲区一变长、格式串又没控制好，这类错误极难排查。所以真正该用的是 `snprintf()`——多一个参数 `n`，最多写 `n - 1` 个字符，剩下的位置留给 `\0`：

```cpp
int snprintf(char* s, size_t n, const char* format, ...);
```

```cpp
char s[12];
int len = snprintf(s, sizeof(s), "%s %s", "hello", "world");

printf("%s\n", s);    // hello world（11 个字符，刚好装下）
printf("%d\n", len);  // 11
```

`snprintf()` 总会自己补上 `\0`。它的返回值有个容易误读的地方：返回的是**格式化后完整字符串的长度**，不是你实际写进去的长度。如果格式串比 `n` 长，返回值会大于等于 `n`，而缓冲区里只留下 `n - 1` 个字符，末尾被截断。所以判断有没有被截断，标准写法是拿返回值和 `n` 比：

```cpp
if (len < (int)sizeof(s)) {
    // 完整写入了
} else {
    // 被截断，s 里不是完整结果
}
```

C++ 里做“数字转字符串”还有更省事的 `to_string()`：

```cpp
string s = to_string(42);        // "42"
string t = to_string(3.14159);   // "3.141590"
```

它按默认精度转换。想控制小数位数、固定宽度、前导零，还是得用 `snprintf`（配一个小缓冲区）或 `stringstream`。所以这一组函数在竞赛里出场率不低，尤其是“把数字写成定宽字符串”这种需求。

## C 字符串函数：一组背景对照

前面各节陆续提到了对应的 C 函数。这一节把它们集中列一遍，说明原型、语义和各自的坑。它们都来自 C 的 `string.h`，C++ 里对应 `<cstring>`（名字放进 `std`），竞赛里被 `bits/stdc++.h` 一并包含。**日常写代码不必用它们，但读题解、读别人的代码、处理 `char` 缓冲区时会遇到。**

| 函数 | 作用 | `string` 里的替代 |
| --- | --- | --- |
| `strlen(s)` | 字符串长度 | `s.size()` |
| `strcpy(d, s)` / `strncpy(d, s, n)` | 复制 | `=` 赋值 / `substr` |
| `strcat(d, s)` / `strncat(d, s, n)` | 拼接 | `+=` |
| `strcmp(a, b)` / `strncmp(a, b, n)` | 比较 | `==`、`<`、`compare()` |
| `strchr(s, c)` | 找字符 | `s.find(c)` |
| `sprintf` / `snprintf` | 格式化写入缓冲区 | `to_string`、`stringstream` |

几个函数的具体行为值得过一遍。

`strcpy()` 把源串的内容复制到目标缓冲区，返回目标指针，因此可以连环写：

```cpp
char s1[] = "hello";
char t[100];
strcpy(t, s1);              // t 变成 "hello"，与 s1 各自独立
puts(t);

strcpy(t, strcpy(t, "ab")); // 返回值就是第一个参数，但这么写没意义，别学
```

用 `strcpy()` 时，第一个参数必须是一块**真正分配好的内存**。下面这种写法是错的：

```cpp
char* p;
strcpy(p, "hello");   // 错误：p 没初始化，指向随机地址
```

`p` 只是个未初始化的指针，字符串可能被写到内存里的任意位置。

`strncpy(d, s, n)` 限制最多复制 `n` 个字符，两种情况行为不同：源串比 `n` 短时，剩下的位置**补 0**；源串比 `n` 长时，复制满 `n` 个字符**且不补 `\0`**，结果 `d` 就不是一个合法字符串了。标准用法要手动补一位：

```cpp
strncpy(dest, src, sizeof(dest) - 1);
dest[sizeof(dest) - 1] = '\0';
```

`strncat(d, s, n)` 最多追加 `n` 个字符，并且**总会**在结果末尾补 `\0`（这点和 `strncpy` 正好相反）。要保证目标空间装得下，常用这个公式：

```cpp
strncat(str1, str2, sizeof(str1) - strlen(str1) - 1);
```

目标变量长度减去当前内容长度再减 1，剩下的就是能容纳新字符的位数。

`strcmp(a, b)` 比较内容，`strncmp(a, b, n)` 只比前 `n` 个字符，返回值都只看符号：

```cpp
char s1[] = "hello world";
char s2[] = "hello C";

if (strncmp(s1, s2, 5) == 0)
    printf("前 5 个字符相同\n");
```

`strcmp` 只用来比较字符串。比较单个字符不要用它——`char` 本身就是个小整数，用 `==` 直接比就行。

最后是几条通用的坑，值得单独记住：

- **不检查边界。** `strcpy`、`strcat`、`sprintf` 都不管目标缓冲区够不够，装不下就溢出去写别人的内存。带 `n` 的版本就是为补这个口子出现的。
- **带 `n` 不一定补 `\0`。** 只有 `strncat` 和 `snprintf` 保证补；`strncpy` 在截断时不补，得自己动手。
- **`strlen` 每次从头扫。** 知道长度就存下来，别放在循环条件里反复调用。
- **类型要配对。** `strlen` 返回 `size_t`，`printf` 配 `%zu`；这些函数都要 `const char*`，`string` 得先 `.c_str()`。
- **空指针会崩。** 传 `nullptr` 进去是直接段错误，用之前先确认指针有效。

顺带说一句设计上的差别：`strncpy`、`snprintf` 这类“安全版本”把长度写成参数，靠调用者自觉传对；`string` 和 `vector` 干脆把长度和缓冲区绑在一起由对象自己管，从设计上消掉了这一类错误。这才是竞赛里优先用 `string` 而不是 `char[]` 的根本原因，省下的不只是敲键盘的力气。

## 字符串数组

一个数组的每个成员都是字符串，就是字符串数组。C 的写法要用二维字符数组：

```cpp
char weekdays[7][10] = {
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
};
```

第一维是字符串个数 7，第二维要按最长的那个字符串来定——`"Wednesday"` 是 9 个字符加 `\0`，取 10，填不满的位置补 `\0`。第一维可以省略，编译器数得出来：

```cpp
char weekdays[][10] = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
```

这种写法的问题一眼可见：第二维统一按最长的算，短的字符串后面全浪费了；一旦出现更长的串，第二维就得跟着改。C 的另一个写法是改成一维的指针数组，每个指针指向一个字面量，空间就不浪费了：

```cpp
char* weekdays[] = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
```

代价是字面量在只读区，**内容不可修改**。

C++ 里就一个写法，又快又省心：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<string> weekdays = {
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    };

    weekdays.push_back("Funday");        // 想加就加，不用预留长度
    for (const string& w : weekdays)     // 按引用遍历，避免每个元素都拷贝一遍
        cout << w.size() << ' ' << w << '\n';

    sort(weekdays.begin(), weekdays.end());   // 按字典序排序
    cout << weekdays[0] << '\n';             // Friday
    return 0;
}
```

`vector<string>` 的每个元素是一个 `string` 对象，各自管着自己的缓冲区，长短不齐也不浪费。遍历时写 `const string&`（或者 `auto&`）是为了免掉每个元素的拷贝——`string` 的拷贝要重新分配内存，在循环里不是小事。

元素个数固定时用 `array<string, 7>` 也行，`size()`、整体赋值、范围 for 一样都有，只是不能增删。需要动态增加字符串，还是 `vector<string>` 方便。
