gl_FragColor.rgb += exposureAmt * vec3(0.3, 0.3, 0.3);
gl_FragColor *= (1.0 + 4.0 * exposureAmt);