
# Orchestration

Chama o reader, e para cada item do retorno, chama o evaluation, e se a condição for verdadeira, chama a transformação.

# Evaluation

Avalia condições em cima de um contexto, recebendo parâmetros puros, não relacionados com o formato de declaração e retorna se a condição é verdadeira.

# Declaration

## Models

Define o formato da declaração.

## Reading

Lê os objetos e os transforma numa interface interna.

# Transformation

## Metadata

Aplica transformações em objetos `_metadata`.

## Rascunho

Aplica transformações em objetos `_object`.

