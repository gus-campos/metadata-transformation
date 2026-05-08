import {
  Behavior,
  BehaviorConfig,
  BehaviorProps,
  FieldMetadataTransform,
  InstanceObject,
  LayoutConfig,
  Metadata,
  MetadataConfig,
  MetadataTransform,
  SelectionConfig,
  UnitMetadataCondition
} from "../models/metadata-transform";

// processMetadata

// 	<iterar>
// 	MetadataTransform

// 		<avaliar root>
// 		FieldMetadataTransform -> evaluate

// 			<decidir e avaliar>
// 			BehaviorConfig
// 			ConditionalMetadata[]
// 			ConditionalMetadata

// 				<avaliar, decidir aplicação e aplicar>
// 				UnitValueCondition
// 				MetadataConfig

let object: InstanceObject;
let metadata: Metadata;

function processMetadata(
  metadata: Metadata,
  object: InstanceObject,
  metadataTransform: MetadataTransform,
) {
  // set globals
  // iterar para cada campo (entrada)
  // chamar processFieldTransform
}

function processFieldTransform(fieldTransform: FieldMetadataTransform) {
  // se não tiver condição, aplicar
  // se for único, avaliar e aplicar
  // se for múltiplo, avaliar cada um
    // se não tiver condição, aplicar
    // do contrário avaliar e aplicar
}

function checkMetadataCondition(unitCondition: UnitMetadataCondition) {
  // Só chama isValueConditionMet
  // deixa flexível pra mudança
}

function applyMetadataConfig(unitCondition: MetadataConfig) {
  // verificar qual o formato
  // aplicar
}

function applyBehaviorConfig(behaviorConfig: BehaviorConfig) {
  // Decidir se 
  // applyBehavior
  // applyBehaviorProps
}

function applyBehavior(behavior: Behavior) {

  // criar constante com as props pra cada behavior
  // fazer switch
  // chamar applyBehaviorProps
}

function applyBehaviorProps(optionsConfig: BehaviorProps) {
  
  // setar props
}

function applySelectionConfig(optionsConfig: SelectionConfig) {
  // verificar se query ou value options
  // validar se é permitido (exemplo: se for ref não pode setar options)
  // se for text não pode query
  // push e splice em value options
}

function applyLayoutConfig(optionsConfig: LayoutConfig) {
 
  // setar props
}