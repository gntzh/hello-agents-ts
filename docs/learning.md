# 学习索引与约定

本仓库用于学习 Agent 开发，技术实现采用 TypeScript 和 Effect。
以 Datawhale Hello Agents 的课程内容与 `code/` 为学习主线，HelloAgents 与 HelloAgents-ts 为成品实现参考；具体主题引用实际阅读过的文件或章节链接，并注明本仓库的改动及原因。

## 本地课程与参考实现

- [Hello Agents 课程](../references/hello-agents-course/README.md)：课程主线，[课程代码](../references/hello-agents-course/code/)。
- [HelloAgents](../references/HelloAgents/README.md)：Python 成品实现。
- [HelloAgents-ts](../references/HelloAgents-ts/README_CN.md)：TypeScript 成品实现。

三者以 Git 子模块保存，固定在主仓库记录的提交上。阅读其源码、示例和测试作为参考，本仓库实现与教学保存在自己的目录中。

首次克隆本仓库：

```sh
git clone --recurse-submodules <本仓库地址>
```

已有克隆中补齐参考代码：

```sh
git submodule update --init --recursive
```

需要主动更新参考版本时，在对应子模块执行 `git fetch origin`，审阅后检出选定提交，再在主仓库提交子模块指针变化。记录引用时注明文件路径与提交，方便复查。

## 内容布局

| 内容 | 位置 | 用途 |
| --- | --- | --- |
| 复用实现 | `src/agents/` | 从章节中沉淀的 Agent 模块，出现实际复用后建立 |
| 章节示例 | `examples/<chapter>/` | 可直接运行的教学代码 |
| 章节练习 | `exercises/<chapter>/` | 题目、起始代码与参考解答 |
| 教学 | `docs/lessons/<chapter>.md` | Agent、TypeScript 工程与 Effect 三条学习线 |
| 个人笔记 | `docs/notes/<chapter>.md` | 疑问、实验、理解变化 |
| 复现记录 | `docs/reproduction/<chapter>.md` | 上游版本、行为对照、实现差异与验证证据 |
| 自由实验 | `playground/` | 尚未整理的探索 |

章节名使用 `00-engineering-basics` 这样的编号加主题，各处保持一致。
编号是本仓库的学习顺序；每章教学标明对应的课程章节与 `code/` 路径。成品实现按能力查阅，引用时记录具体路径。
当前从 [00 工程与 Effect 入门](lessons/00-engineering-basics.md) 开始。
后续沿课程章节推进，在相应主题穿插 TypeScript 工程与 Effect 学习；成品实现用于对照设计和工程实践。按实际学习进度建目录。

每章练习用 `README.md` 说明目标、运行方法与验收标准；起始代码放 `starter.ts`，参考答案放 `solution.ts`。先读题和尝试，再查看答案。起始代码保持可编译，未完成的行为由题目明确说明。

类型检查覆盖 `src/`、`examples/`、`exercises/` 与 `playground/`；构建只编译 `src/` 到 `dist/`，示例与练习通过 tsx 直接运行。

## AI 辅助实现与注释

用中文解释关键设计原因、约束、错误边界及不直观的类型；简单赋值和直观调用由命名表达。
首次出现的 Effect 构造、组合与运行边界应在示例旁简短说明，长篇原理放教学文档。
公共接口在需要时用 TSDoc 说明输入、输出和失败条件；调整代码时同步修订注释。
练习的起始代码保留目标和提示，完整推导放参考答案与教学中。

## 面向 Rust 的理解

教学可借助熟悉的 Rust 概念解释 TypeScript 和 Effect，同时指出差异：TypeScript 类型在运行时擦除，Effect 的错误和依赖参数也不等同于 Rust 的 Result、trait 或借用检查。
可迁移的行为契约、输入输出样例和错误语义写入复现记录。当前优先实现清晰的 TypeScript 模块，Rust 版本在实际迁移时再建立。

## 编写教学

使用中文，先说本节要解决的问题和前置知识，再给出最小可运行示例。
说明运行命令、预期结果和执行流程，解释 Agent 概念以及 Effect 在此处解决的问题。
安排一个可以自行修改并观察结果的小练习，列出参考来源与实现差异。
涉及模型调用时说明所需配置与调用成本；能离线验证的逻辑提供离线验证方式。

## 记录笔记

围绕实际发生的学习过程记录：日期、原来的理解、疑问、做过的实验、观察结果与当前结论。
助手可以整理用户表达的理解，并把助手建议标明为建议；待用户验证的内容保留为待验证。
个人掌握程度与学习感受由用户提供。

## 当前进度

工程初始化已完成，可通过 `pnpm start` 运行 Effect 日志示例。
Agent 主题教学和个人学习笔记尚未开始。
