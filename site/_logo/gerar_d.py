import json, math, sys
def bez(p0,p1,p2,p3,n=400):
    out=[]
    for i in range(n+1):
        t=i/n;u=1-t
        out.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                    u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    return out
def reta(a,b): return bez(a,a,b,b,50) if False else [(a[0]+(b[0]-a[0])*i/50,a[1]+(b[1]-a[1])*i/50) for i in range(51)]
def amostrar(segs, cantos, passo):
    """segs: lista de polilinhas densas (cada uma começa onde a anterior terminou).
    Cada segmento é amostrado por comprimento de arco, com nº inteiro de passos (pontos iguais)."""
    pts=[]
    for k,s in enumerate(segs):
        L=[0]
        for i in range(1,len(s)): L.append(L[-1]+math.dist(s[i-1],s[i]))
        n=max(1,round(L[-1]/passo))
        j=0
        for m in range(n):
            alvo=L[-1]*m/n
            while L[j+1]<alvo: j+=1
            f=(alvo-L[j])/((L[j+1]-L[j]) or 1)
            x=s[j][0]+(s[j+1][0]-s[j][0])*f; y=s[j][1]+(s[j+1][1]-s[j][1])*f
            p=[round(x,1),round(y,1),0]
            if m==0 and k in cantos: p[2]=1
            pts.append(p)
    return pts
def D(P):
    X0,X1=P['haste']            # haste: esquerda / direita (retas)
    TOPO,TOPOI=P['topo']        # y externo / interno do topo
    BASE,BASEI=P['base']        # y externo / interno da base
    XR,XRI=P['direita']         # x externo / interno da barriga
    YR,YRI=P['yDireita']
    SERIFA=P['serifa']
    A=(X0,P['cantoTopo']); B=(P['xTopo'],TOPO); C=(XR,YR)
    F=(P['xBase'],BASE); G=(SERIFA,BASE); H=(SERIFA,BASE-P['serifaAlt'])
    I=(X0,BASE-P['flare'])
    ext=[
      bez(A,(A[0]+P['topoEsq'][0],A[1]+P['topoEsq'][1]),(B[0]-P['topoEsq'][2],TOPO),B),
      bez(B,(B[0]+P['kT'][0]*(XR-B[0]),TOPO),(XR,YR-P['kT'][1]*(YR-TOPO)),C),
      bez(C,(XR,YR+P['kB'][0]*(BASE-YR)),(F[0]+P['kB'][1]*(XR-F[0]),BASE),F),
      reta(F,G), reta(G,H),
      bez(H,(H[0]+P['pe'][0],H[1]-P['pe'][1]),(X0,I[1]+P['pe'][2]),I),
      reta(I,A)]
    J=(X1,TOPOI+P['colchete']); K=(X1+P['colchete'],TOPOI); L=(XRI,YRI)
    M=(P['xBaseI'],BASEI); N=(X1+P['colcheteB'],BASEI); O=(X1,BASEI-P['colcheteB'])
    q=0.5523
    inn=[
      bez(J,(X1,J[1]-q*(J[1]-TOPOI)),(K[0]-q*(K[0]-X1),TOPOI),K),
      bez(K,(K[0]+P['kI'][0]*(XRI-K[0]),TOPOI),(XRI,YRI-P['kI'][1]*(YRI-TOPOI)),L),
      bez(L,(XRI,YRI+P['kBI'][0]*(BASEI-YRI)),(M[0]+P['kBI'][1]*(XRI-M[0]),BASEI),M),
      reta(M,N),
      bez(N,(N[0]-q*(N[0]-X1),BASEI),(X1,O[1]+q*(BASEI-O[1])),O),
      reta(O,J)]
    return [amostrar(ext,{0,4,5},P['passo']), amostrar(inn,set(),P['passo'])]
P=dict(haste=(316,384),topo=(504,523),base=(939,922),direita=(679,592),yDireita=(698,700),
  kT=(0.76,0.52),kI=(0.56,0.88),kB=(0.6,0.44),kBI=(0.8,0.36),serifa=274,serifaAlt=10,flare=92,pe=(24,2,50),
  cantoTopo=528,xTopo=445,topoEsq=(30,-12,48),xBase=425,xBaseI=440,colchete=36,colcheteB=34,passo=24)
if __name__=='__main__':
    json.dump(D(P),open('d-novo.json','w'))
    print([len(c) for c in D(P)])
