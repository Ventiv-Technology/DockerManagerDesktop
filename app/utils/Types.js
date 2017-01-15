// @flow
declare module CSSModule {
  declare var exports: { [key: string]: string };
}

export type ImageInfo = {
  name: string,
  namespace: string,
  namespaced: boolean,
  registry?: string,
  repository: string,
  tag: string
};

export type PortDefinition = {
  containerPort: number,
  hostPort: number,
  portType: string
};

export type PortType = {
  port: number,
  type: string
};

export type ServiceInstanceAppConfiguration = {
  count: number,
  environment: any,
  memoryLimit?: string,
  memorySwapLimit?: string,
  ports: Array<any>,                        // TODO: Define this
  server?: string,
  type: string,
  volumeMappings?: Array<any>               // TODO: Define this
};

export type ApplicationConfiguration = {
  branches?: Array<string>,
  description: string,
  environmentId: string,
  extraInformationPartial: string,
  id: string,
  loadBalance?: string,
  serviceInstanceUrl?: string,
  serviceInstances: Array<ServiceInstanceAppConfiguration>,
  serviceSelectionAlgorithm?: string,
  tierName: string,
  url: string,
  versionSelection: any
};

export type ServerServiceConfiguration = {
  instanceNumber: number,
  portMappings: Array<PortType>,
  serviceNameDescription?: string,
  type: string
};

export type ServerConfiguration = {
  buildEnabled: boolean,
  description: string,
  eligibleServices: Array<ServerServiceConfiguration>,
  hostname: string,
  id: string,
  resolveHostname: boolean
};

export type EnvironmentConfiguration = {
  applications: Array<ApplicationConfiguration>,
  description: string,
  id: string,
  servers: Array<ServerConfiguration>,
  tierName: string
};

export type ServiceInstance = {
  additionalMetrics: any,
  applicationDescription: string,
  applicationId: string,
  availableVersions?: Array<string>,
  buildPossible: boolean,
  containerCreatedDate: string,
  containerId: string,
  containerImage: ImageInfo,
  containerImageId: string,
  containerStatus: string,
  containerStatusTime: string,
  environmentDescription: string,
  environmentName: string,
  instanceNumber: number,
  loggingConfig: any,
  loggingType: string,
  name: string,
  newBuildPossible: boolean,
  portDefinitions: Array<PortDefinition>,
  resolvedEnvironmentVariables: any,
  serverName: string,
  serviceDescription: string,
  status: string,
  tierName: string,
  url: string
};

export type DockerManagerServerConfiguration = {
  icon: string,
  id: string,
  name: string,
  password: string,
  selected: boolean,
  url: string,
  username: string
};
