import * as cdk from "@aws-cdk/core";
import { AutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import {
    AmazonLinuxImage,
    InstanceClass,
    InstanceSize,
    InstanceType,
    ISecurityGroup,
    IVpc,
    SubnetType
  } from "@aws-cdk/aws-ec2";
import { ApplicationLoadBalancer } from "@aws-cdk/aws-elasticloadbalancingv2";
import { Role } from "@aws-cdk/aws-iam";

interface ComputeStackProps extends cdk.StackProps {
    vpc: IVpc;
    instanceRole: Role;
    appSg: ISecurityGroup;
}

export class ComputeStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        const prj: string = this.node.tryGetContext("prj");
        const stage: string = this.node.tryGetContext("stage");
        const params: any = this.node.tryGetContext(stage);

        const asg = new AutoScalingGroup(this, "ASG", {
            vpc: props.vpc,
            instanceType: InstanceType.of(
                InstanceClass.BURSTABLE2,
                InstanceSize.NANO
            ),
            machineImage: new AmazonLinuxImage(),
            allowAllOutbound: true,
            role: props.instanceRole
        });

        asg.addUserData(
            "yum -y update",
            "yum -y install nginx",
            "systemctl enable nginx",
            "systemctl start nginx"
        );

        asg.node.applyAspect(new cdk.Tag('Name',`${prj}-${stage}-asg`));

        const alb = new ApplicationLoadBalancer(this, "ALB",{
            vpc: props.vpc,
            vpcSubnets: { subnetType: SubnetType.PUBLIC },
            internetFacing: true,
            loadBalancerName: `${prj}-${stage}-alb`
        });

        const listener = alb.addListener("Listener", {
            port: 80
        });
        listener.addTargets("Target", {
            targets: [asg],
            port: 80
        });

        alb.node.applyAspect(new cdk.Tag('Name',`${prj}-${stage}-alb`));
        
    }
}