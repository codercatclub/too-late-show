float lAmt = pow(exposureAmt, 2.0);
gl_FragColor.rgb += lAmt * vec3(0.3, 0.3, 0.3);
gl_FragColor *= (1.0 + 8.0 * lAmt);