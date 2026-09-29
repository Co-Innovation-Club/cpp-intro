---
title: "字符串"
description: "C++ 用 std::string 表示字符串，本章讲它的长度、复制、拼接、比较、查找与整行读入，并介绍字符数组这一底层表示方式与处理它的标准库函数。"
---
# 字符串

## 简介

C++ 用标准库提供的 `std::string`（下称 `string`）表示字符串，竞赛代码通常使用它。字符串在内存中也可以用 `char` 数组存放，这是更底层的表示方式：遇到 `char buf[100]` 这类读入缓冲区、或阅读他人题解时需要读懂这种写法。本章以 `string` 为主线，字符数组在需要时另作说明。

字符串是一段连续的字符，依次存放：

```cpp
char s[] = {'H', 'e', 'l', 'l', 'o', '\0'};
// 等价于
char s[] = "Hello";
```

结尾那个全是二进制 0 的字节写作 `'\0'`，叫**空字符**（null character），用来标记字符串到此结束。`'\0'` 和字符 `'0'` 不是一回事：前者的 ASCII 值是 0，后者是 48。所以 `"Hello"` 实际占 6 个字节——5 个字符加一个 `'\0'`。

有了这个结尾标记，程序不必事先知道长度即可遍历字符串：逐字节检查，遇到 `\0` 停止。这是以空字符结尾的字符数组的全部机制，也是相关问题的根源——长度由数到 `\0` 得到，一旦某处缺少终止符，依赖它的函数会继续读取边界之外的内存。

双引号写的是字符串，单引号写的是字符，两者不能混用：

```cpp
char c = 'A';     // 字符，占 1 字节
char s[] = "A";   // 字符串，占 2 字节：'A' 和 '\0'
```

双引号里只有一个字符时，它仍是字符串。单引号里写多个字符（比如 `'Hello'`）是编译错误。

字符串内部要放双引号、换行、制表符，用反斜杠转义：

```cpp
"She replied, \"It does.\""
"Hello, world!\n"
"第一列\t第二列"
```

字面量过长时可以折行。行尾写反斜杠表示续行，但下一行不能缩进，否则缩进会被算进字符串；另一种做法是把多段字面量并排书写，编译器会将它们连接：

```cpp
string greeting = "Hello, "
                  "how are you "
                  "today!";
// 等同于 "Hello, how are you today!"
```

上面用的是 `string`，字符数组同样支持这种相邻字面量的拼接。

`std::string` 是标准库提供的一个类，内部管理一段字符缓冲区（含结尾的 `\0`），把长度、拼接、比较、查找这些操作实现为成员函数或运算符。它来自头文件 `<string>`，竞赛中被 `bits/stdc++.h` 一并包含。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s = "Hello";
    cout << s << " " << s.size() << '\n';   // Hello 5
    return 0;
}
```

开头两行是竞赛代码的常见写法：`bits/stdc++.h` 是 GCC 提供的一次性包含全部标准库头文件的写法，代价是编译稍慢；`using namespace std;` 让 `std::` 前缀可以省略。原因和代价见《C++ 简介》。以下各节以 `string` 为主，需要时说明字符数组的写法。

## 字符串变量的声明

`string` 的声明和普通变量一样，可以直接用字面量初始化，也可以用另一个 `string` 初始化：

```cpp
string s1;                    // 空字符串，长度 0
string s2 = "Hello, world!";  // 从字面量
string s3 = s2;               // 从另一个 string 复制，s3 是独立的一份
string s4(5, 'x');            // "xxxxx"，5 个字符 'x'
```

`s1` 是空串，不是“没有值”。`string` 保证完成初始化，不存在内容为随机值的情况。

字符串也可以用字符数组或字符指针表示，写法如下：

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

这两种写法有以下差异。

第一，**字符指针指向的字符串不可写**。字面量存放在只读的常量区，通过指针去改它属于未定义行为，运行时通常导致程序终止：

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

修改数组内容需要用 `strcpy()` 把新内容复制进去（见「字符数组处理函数」一节），数组自身的地址不变。

`string` 统一了这两种行为：`s[0] = 'z'` 合法，`s = "world"` 也合法。缓冲区由对象自身管理，不涉及字面量只读区的限制，也没有数组名与地址绑定的限制。

但 `string` 并非在所有场景都安全，其安全性体现在以下方面：

```cpp
string s = "hi";
cout << s[5];     // 未定义行为：s[i] 不做越界检查
cout << s.at(5);  // 抛 out_of_range 异常，程序直接终止
```

`s[i]` 不做边界检查，越界即未定义行为；`s.at(i)` 做检查，越界时抛出 `out_of_range` 异常，程序终止。竞赛评测中该异常表现为 RE，不会给出恢复的机会，因此仍需自行确认下标合法。`string` 保证拼接与复制不溢出，下标访问不受此保证。

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

`cin >> n` 之后紧跟 `getline(cin, s)` 时，`s` 会读到空串：`cin >> n` 读完数字后把行尾的换行符留在输入流中，`getline` 读到该换行符即返回。处理方式是在两者之间读取并丢弃这一行的剩余内容：

```cpp
int n;
cin >> n;
string dummy;
getline(cin, dummy);   // 吃掉数字后面的换行符
string s;
getline(cin, s);       // 现在才读到真正的第一行
```

出现“先读整数、再读整行”的组合时需要检查这个顺序问题。`>>` 把换行符留在输入流中，`getline` 会读取该换行符。

## 字符串的长度

`string` 有 `size()`，还有一个完全等价的 `length()`，两者都返回字符个数，不含结尾的 `\0`（那不属于字符串内容）：

```cpp
string s = "hello";
cout << s.size() << '\n';     // 5
cout << s.length() << '\n';   // 5，和 size() 完全一样
```

返回类型同样是 `size_t`，无符号。所以数组那章关于 `v.size() - 1` 在空容器上回绕的提醒，对字符串一样成立。判断空串用 `s.empty()`，语义更明确：

```cpp
if (s.empty()) cout << "空串\n";
```

字符数组的长度用 `strlen()` 得到，它从首字节扫描到 `\0` 以确定长度。标准库在 `<cstring>` 中提供这组字符数组处理函数，原型如下：

```cpp
size_t strlen(const char* s);
```

```cpp
const char* p = "hello";
printf("%zu\n", strlen(p));   // 5
```

两个概念不同：`strlen()` 得到的是**内容长度**，`sizeof()` 得到的是变量占用的**字节数**。

```cpp
char s[50] = "hello";
printf("%zu\n", strlen(s));   // 5
printf("%zu\n", sizeof(s));   // 50
```

`string` 把长度记录在对象中，`size()` 读取该字段，复杂度 O(1)；`strlen()` 每次从头部扫描至 `\0`，复杂度 O(长度)。在循环条件中反复调用 `strlen(s)` 会带来额外开销，应先将长度存入变量。

## 字符串的复制

`string` 的复制就是赋值，语义是**深拷贝**：复制出独立的一份，改其中一个不影响另一个。

```cpp
string a = "hello";
string b = a;      // 复制内容
b[0] = 'z';
cout << a << ' ' << b << '\n';   // hello zello
```

字面量、`char*`、字符数组都能赋给 `string`，可以重复赋值：

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

字符数组不支持整体赋值：

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

要复制内容，只能调用 `strcpy()`、`strncpy()`，或者自行编写循环逐字符赋值。这几个函数的细节放在后面「字符数组处理函数」一节统一讲。

## 字符串的拼接

`string` 用 `+` 拼接，用 `+=` 追加，长度自动增长，不会溢出。

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

以下几点：

- `+` 的操作数至少有一个是 `string`。`"abc" + "def"` 是两个 `const char*` 相加，指针相加无意义，无法通过编译；写成 `string("abc") + "def"` 才合法。
- `+` 每次生成一个新串，在同一字符串上反复追加时应使用 `+=`。
- 拼接数字需要显式转换。`s + 42` 无法通过编译，应写 `s + to_string(42)`。

`append()` 比 `+` 多几种拼法，能拼上若干个相同字符，或者只拼另一个字符串的前几个字符：

```cpp
string s = "ab";
s.append(3, 'x');       // "abxxx"
s.append("cdef", 2);    // 再拼上 "cd"
```

拼接内容类型较多（字符串、数字、字符交替）时，可将各部分依次写入 `stringstream`（来自 `<sstream>`），最后一次性取出结果。

字符数组的拼接用 `strcat()`，把第二个字符串接到第一个的末尾：

```cpp
char s1[12] = "hello";
char s2[6] = "world";

strcat(s1, s2);    // s1 变成 "helloworld"
```

隐患在于 `strcat()` **完全不检查目标缓冲区还剩多少空间**。上面 `s1` 正好 12 字节，拼完刚好装下；写成 `s1[8]` 时，超出的字符会被写到数组边界之外。`<cstring>` 中另有一个 `strncat()`，多一个“最多追加几个字符”的参数，细节见后文的统一说明。

## 字符串的比较

`string` 直接用关系运算符比较：`==` 判相等，`<`、`>` 按**字典序**（lexicographic order），也就是逐字符比 ASCII 码，第一个不同字符的 ASCII 大小决定结果。

```cpp
string a = "banana", b = "apple", c = "banana";

cout << (a == b) << '\n';       // 0，不相等
cout << (a == c) << '\n';       // 1，相等
cout << (a < b) << '\n';        // 0，'b' > 'a'
cout << ("apple" < a) << '\n';  // 1
```

`string` 重载了比较运算符，能用 `==` 直接比较两个对象的内容。字符数组不能这样比较：

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

**`strcmp` 的返回值只有符号有意义**，具体是 -1 还是 -13 由实现决定，不能依赖具体数值，因此不应写 `strcmp(a, b) == -1`。只比较前 `n` 个字符用 `strncmp()`。

`string` 另外提供了 `compare()` 成员函数，返回值同样是“负数 / 0 / 正数”，语义和 `strcmp()` 一致，适用于需要返回整数的排序场景：

```cpp
if (a.compare(b) < 0) { ... }   // a 的字典序在 b 之前
```

排序是竞赛中的常见场景。`string` 自带 `<`，把多个字符串排成字典序的写法如下：

```cpp
vector<string> v = {"banana", "apple", "cherry"};
sort(v.begin(), v.end());   // apple, banana, cherry
```

使用 `char*` 数组排序需要额外传入比较函数，比较函数若写成比较指针地址，排序结果错误。

## 字符串的查找与修改

以下查找、读写、插入与删除操作都由 `string` 直接提供，多数一行写完。

**查找**。 `find(x)` 返回 `x` 第一次出现的下标，找不到返回 `string::npos`——一个表示“无此位置”的特殊常量，值是 `size_t` 的最大值：

```cpp
string s = "hello world";

size_t p = s.find("world");
if (p != string::npos) cout << p << '\n';      // 6

if (s.find('z') == string::npos) cout << "没找到 z\n";
```

`rfind` 从右往左找第一次出现的位置；`find` 也可以指定从哪个下标开始找，例如 `s.find("l", 4)` 从下标 4 开始找 `"l"`。

**下标读写**。 `s[i]` 拿到的是 `char` 的引用，可以直接改：

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

**插入、删除、替换**。

```cpp
string s = "hello";
s.insert(5, " world");   // 在下标 5 处插入，"hello world"
s.erase(5, 6);           // 从下标 5 起删 6 个字符，退回 "hello"
s.replace(1, 4, "i");    // 把 [1, 5) 这段换成 "i"，得到 "hi"
```

这三个函数要求调用者保证参数中的下标和长度合法。`insert` 的下标可以等于 `size()`（表示插在末尾），`erase` 的下标必须小于 `size()`，越界就是未定义行为。

**尾部增减**还有更快的写法，和 `vector` 一致：

```cpp
string s;
s.push_back('a');   // 末尾加一个字符，变成 "a"
s.pop_back();       // 删掉末尾一个字符，退回空串
```

**清空与判空**。 `s.clear()` 清空，`s.empty()` 判空。

**转成字符数组表示的字符串**。 标准库中有一组以 `const char*` 为参数的函数（`printf` 的 `%s`、`fopen`、`strlen` 等），需要把 `string` 传进去时用 `c_str()`：

```cpp
string s = "hello";
printf("%s\n", s.c_str());
```

`c_str()` 返回的指针指向 `string` 自己的内部缓冲区，**该 `string` 被修改或销毁后指针即失效**，不应长期保存。

反过来，把字符数组的内容转成 `string`，直接赋值即可：

```cpp
char buf[] = "hello";
string s = buf;   // 内容被复制一份，s 与 buf 再无关系
```

## sprintf()，snprintf()

这一组不是 `string` 的成员，而是把数据**格式化写进字符缓冲区**的标准库函数，声明在 `<cstdio>` 中。竞赛中的用途是把整数、浮点数按指定格式拼成字符串。

`sprintf()` 的用法和 `printf()` 一样，只是第一个参数换成目标缓冲区，结果写进那里而不是输出到屏幕：

```cpp
char s[40];
string first = "hello", last = "world";

sprintf(s, "%s %s", first.c_str(), last.c_str());
printf("%s\n", s);   // hello world
```

返回值是写入的字符数，不计结尾的 `\0`；出错返回负数。

`sprintf()` 不检查目标缓冲区的大小，写入超出时溢出到其他内存。缓冲区长度变化、格式串未受控时，此类错误的定位成本高。适用的函数是 `snprintf()`：它多了参数 `n`，最多写 `n - 1` 个字符，剩下的位置留给 `\0`：

```cpp
int snprintf(char* s, size_t n, const char* format, ...);
```

```cpp
char s[12];
int len = snprintf(s, sizeof(s), "%s %s", "hello", "world");

printf("%s\n", s);    // hello world（11 个字符，刚好装下）
printf("%d\n", len);  // 11
```

`snprintf()` 总会补上结尾的 `\0`。它的返回值容易被误读：返回的是**格式化后完整字符串的长度**，不是实际写进去的长度。如果格式串比 `n` 长，返回值会大于等于 `n`，而缓冲区里只留下 `n - 1` 个字符，末尾被截断。所以判断有没有被截断，标准写法是拿返回值和 `n` 比：

```cpp
if (len < (int)sizeof(s)) {
    // 完整写入了
} else {
    // 被截断，s 里不是完整结果
}
```

C++ 中数字转字符串还可使用 `to_string()`：

```cpp
string s = to_string(42);        // "42"
string t = to_string(3.14159);   // "3.141590"
```

它按默认精度转换。需要控制小数位数、固定宽度、前导零时，仍然要用 `snprintf`（配一个小缓冲区）或 `stringstream`。竞赛中“把数字写成定宽字符串”这类需求常用到这两个函数。

## 字符数组处理函数

前面各节陆续提到了这些函数。这一节把它们集中列一遍，说明原型、语义和各自的使用限制。它们是标准库 `<cstring>` 提供的一组字符数组处理函数，竞赛里被 `bits/stdc++.h` 一并包含。**日常写代码不必用它们，但读题解、读别人的代码、处理 `char` 缓冲区时会遇到**。

| 函数 | 作用 | `string` 里的替代 |
| --- | --- | --- |
| `strlen(s)` | 字符串长度 | `s.size()` |
| `strcpy(d, s)` / `strncpy(d, s, n)` | 复制 | `=` 赋值 / `substr` |
| `strcat(d, s)` / `strncat(d, s, n)` | 拼接 | `+=` |
| `strcmp(a, b)` / `strncmp(a, b, n)` | 比较 | `==`、`<`、`compare()` |
| `strchr(s, c)` | 找字符 | `s.find(c)` |
| `sprintf` / `snprintf` | 格式化写入缓冲区 | `to_string`、`stringstream` |

以下说明几个函数的具体行为。

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

`strncpy(d, s, n)` 限制最多复制 `n` 个字符，两种情况行为不同：源串比 `n` 短时，剩下的位置**补 0**；源串比 `n` 长时，复制满 `n` 个字符**且不补 `\0`**，结果 `d` 就不是一个合法字符串了。标准用法是手动补一位：

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

`strcmp` 用于比较字符串。比较单个字符不使用 `strcmp`——`char` 本身就是个小整数，用 `==` 直接比即可。

以下是几个共性问题：

- **不检查边界**。 `strcpy`、`strcat`、`sprintf` 都不管目标缓冲区够不够，装不下就写到超出边界的内存上。带 `n` 的版本用于限制写入或复制的长度。
- **带 `n` 不一定补 `\0`**。 只有 `strncat` 和 `snprintf` 保证补；`strncpy` 在截断时不补，需要手动写入 `\0`。
- **`strlen` 每次从头扫**。 已知长度时存入变量，不应放在循环条件里反复调用。
- **类型要配对**。 `strlen` 返回 `size_t`，`printf` 配 `%zu`；这些函数都要求 `const char*`，`string` 需先调用 `.c_str()`。
- **空指针会导致运行错误**。 传入 `nullptr` 触发段错误，调用前需确认指针有效。

设计上的差别在于：`strncpy`、`snprintf` 这类带长度参数的函数把长度交给调用者传实参，正确性依赖调用者；`string` 和 `vector` 把长度和缓冲区绑定，由对象自己管理，从设计上消除了这一类错误。这是竞赛里优先用 `string` 而不是 `char[]` 的原因。

## 字符串数组

一个数组的每个成员都是字符串，就是字符串数组。用字符数组表示时写成二维字符数组：

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

第一维是字符串个数 7，第二维要按最长的那个字符串来定——`"Wednesday"` 是 9 个字符加 `\0`，取 10，填不满的位置补 `\0`。第一维可以省略，编译器按初值个数自动确定：

```cpp
char weekdays[][10] = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
```

这种写法的缺点是：第二维统一按最长的算，短的字符串后面空出的位置未被使用；一旦出现更长的串，第二维就得跟着改。另一种写法是一维的指针数组，每个指针指向一个字面量：

```cpp
char* weekdays[] = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
```

代价是字面量在只读区，**内容不可修改**。

用 `vector<string>` 则没有上述限制：

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

`vector<string>` 的每个元素是一个 `string` 对象，各自管理自己的缓冲区，长度不同也不占用多余的空间。遍历时写 `const string&`（或者 `auto&`）是为了避免每个元素都发生拷贝——`string` 的拷贝要重新分配内存，在循环里带来额外开销。

元素个数固定时用 `array<string, 7>` 也行，`size()`、整体赋值、范围 for 一样都有，只是不能增删。需要动态增加字符串，使用 `vector<string>`。
