# Solidity for Blockly

## About

This projects goal is to add support for the [Solidity](https://solidity.readthedocs.io) language (the main language
used to create smart contracts for the [Ethereum](https://www.ethereum.org/) blockchain) in the
[Blockly](https://developers.google.com/blockly/) visual programming tool.

## Motivations

Courtesy @promethe42

I see a lot of articles here and there stating that the blockchain makes it possible to build decentralized
communities. Those articles are completely oblivious to the fact that even if smart contracts execution is indeed
enforced by a decentralized blockchain network, those contracts are still written by actual developers.

Taking into account that "code is law", the ability to actually write smart contracts becomes a new logical SPOF.
No true decentralized community will ever exist as long as the production of its code (its "laws") is not accessible to just any of its members.

Thus, the need to make it easier to create, distribute and run smart contracts with as less technical skills as
possible. Blockly being an initiative to introduce programming to children, it felt like the right way to start
experimenting.

## Install

* `mkdir www && cd www`
* `git clone https://github.com/google/blockly.git`
* `git clone https://github.com/rekmarks/blockly-solidity.git`
* `python -m SimpleHTTPServer` or `python3 -m http.server`

Then open http://localhost or http://0.0.0.0:8000 in your web browser and click `blockly-solidity`.

## Features

* support for the `bool`, `int` and `uint` types
* smart contract states, constructor and methods
* declaration, read and assignation of contract states
* declaration and read of method parameters
* math operators `+`, `-`, `/`, `x`
* `if then else` control structures
* scopes for contract states and method parameters
* type-safe state assignations
* state/method parameters name & type refactoring

I'm guessing other features (such as loops and more complex math/logical expressions) might work, but
I didn't have enough time to test them.

## Todo

### Next up
* minimum smart contract using blocks at a higher-than-syntactic level of abstraction

### Later
* variable (state) access control
* add support for all types
* add support for all operators

## Example

This Blockly program:

![Example Solidity program created with Blockly](./example.jpg)

will generate the following Solidity code:

```solidity
pragma solidity ^0.4.2;

contract Counter {
  uint counter = 0;
  uint max = 0;
  function () { throw; }
  function Counter(uint max) {
    this.max = max;
    this.counter = 0;
  }
  function increment(this.counter = this.counter + 1;) {
    if (this.counter >= this.max) {
      this.counter = 0;
    }
  }
}
```
