import { Construct, Stack, StackProps, Tag } from "@aws-cdk/core";
import { Port, SecurityGroup, SubnetType, Vpc } from "@aws-cdk/aws-ec2";

export class NetworkStack extends Stack {

  public readonly vpc: Vpc;
  public readonly appSg: SecurityGroup;
  public readonly dbSg: SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);

      const prj: string = this.node.tryGetContext("prj");
      const stage: string = this.node.tryGetContext("stage");
      const params: any = this.node.tryGetContext(stage);

      // vpc
      this.vpc = new Vpc(this, "VPC", {
        enableDnsHostnames: true,
        enableDnsSupport: true,
        natGateways:params['nat_gateways'],
        maxAzs: 2,
        subnetConfiguration: [
            { name: "PUB", subnetType: SubnetType.PUBLIC, cidrMask: 24 },
            { name: "PRI", subnetType: SubnetType.PRIVATE, cidrMask: 24 },
            { name: "ISOLATED", subnetType: SubnetType.ISOLATED, cidrMask: 24 }
        ]
      });
      this.vpc.node.applyAspect( new Tag("Name", `${prj}-${stage}-vpc`));

      this.appSg = new SecurityGroup(this, "AppSg", {
          allowAllOutbound: true, 
          vpc: this.vpc,
          securityGroupName: `${prj}-${stage}-app-sg`,
          description: `${prj}-${stage}-app`
      });
      this.appSg.addIngressRule(
          this.appSg,
          Port.tcp(80),
          "allow http access from alb"
      );
      this.appSg.node.applyAspect(new Tag("Name", `${prj}-${stage}-app-sg`));

      this.dbSg = new SecurityGroup(this, "DbSg", {
          allowAllOutbound: true, 
          vpc: this.vpc,
          securityGroupName: `${prj}-${stage}-db-sg`,
          description: `${prj}-${stage}-db-sg`
      });

      this.dbSg.addIngressRule(
        this.dbSg,
        Port.tcp(3389),
        "allow http access from aurora RDS "
      );
      this.dbSg.node.applyAspect(new Tag("Name", `${prj}-${stage}-db-sg`));
  }

}