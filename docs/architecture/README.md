# Architecture Diagrams

This folder contains visual architecture diagrams for the project in Mermaid format. Use the diagrams to understand the relationships between Services, Actions, and Reactions, and the runtime flow when an Action triggers a Reaction.

Rendered Mermaid diagrams are embedded below for quick browsing.

## Class Diagram

```mermaid
classDiagram
    class User
    class Action
    class Reaction
    class Service
    class TriggerManager
    class Integration

    User --> Action : creates/owns
    Action --> TriggerManager : enqueues/triggers
    TriggerManager --> Reaction : invokes
    Reaction --> Integration : calls
    Service <|-- Action
    Service <|-- Reaction

    note for TriggerManager "Orchestrates triggers and retries"
    note for Integration "External API / third-party service"
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant AS as ActionService
    participant TM as TriggerManager
    participant RS as ReactionService
    participant ES as ExternalService

    U->>AS: create/trigger Action
    AS->>TM: enqueue trigger
    TM->>RS: dispatch Reaction
    RS->>ES: perform external operation
    ES-->>RS: response
    RS-->>U: notify / update state
```
