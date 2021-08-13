uniform float timeMSec;
uniform float cameraMove;

attribute vec3 color;

varying vec3 vNormal;
varying float vDist;
varying vec3 vWorldPos;
varying float vReflectionFactor;

void main(){
  vNormal = normal;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(normal) );

  worldPos.x += 2.0 * cameraMove * sin(0.01*timeMSec);
  worldPos.z += 3.0 * cameraMove * cos(0.1 + 0.02*timeMSec + worldPos.x);

  vWorldPos = worldPos.xyz;

  vDist = color.r;




  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;

  float mFresnelBias = 0.01;
  float mFresnelScale = 2.1;
  float mFresnelPower = 2.1;
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );

  float d = min(length(I)/100.0, 1.0);
  //vReflectionFactor = mix(vReflectionFactor, 1.0, d);
  vNormal.r = 1.0 - smoothstep(60.0,150.0,length(I));
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
}